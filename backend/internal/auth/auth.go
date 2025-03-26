package auth

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/whatsapp/backend/internal/logger"
	"github.com/whatsapp/backend/internal/models/entity"
)

// Erros de autenticação
var (
	ErrInvalidToken       = errors.New("autenticação inválida")
	ErrExpiredToken       = errors.New("autenticação expirada")
	ErrInvalidCredentials = errors.New("credenciais inválidas")
)

// TokenClaims representa os claims do JWT
type TokenClaims struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// Service fornece funcionalidades relacionadas à autenticação
type Service struct {
	jwtSecret        string
	tokenExpiry      time.Duration
	refreshTokenRepo RefreshTokenRepository
}

// RefreshTokenRepository é uma interface para persistir tokens de atualização
type RefreshTokenRepository interface {
	Create(token *entity.RefreshToken) error
	GetByToken(token string) (*entity.RefreshToken, error)
	Invalidate(token string) error
	InvalidateAllForUser(userID int64) error
}

// NewAuthService cria uma nova instância do serviço de autenticação
func NewAuthService(refreshTokenRepo RefreshTokenRepository) *Service {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		logger.Warning("JWT_SECRET não definido, usando valor padrão")
		jwtSecret = "default_secret_key_change_in_production"
	}

	tokenExpiryStr := os.Getenv("JWT_EXPIRY")
	tokenExpiry, err := time.ParseDuration(tokenExpiryStr)
	if err != nil {
		logger.Warning("JWT_EXPIRY inválido ou não definido, usando 15 minutos como padrão", err)
		tokenExpiry = 15 * time.Minute
	}

	return &Service{
		jwtSecret:        jwtSecret,
		tokenExpiry:      tokenExpiry,
		refreshTokenRepo: refreshTokenRepo,
	}
}

// GetTokenExpiry retorna a duração de expiração do token JWT
func (s *Service) GetTokenExpiry() time.Duration {
	return s.tokenExpiry
}

// GetRefreshTokenByToken busca um token de atualização pelo valor do token
func (s *Service) GetRefreshTokenByToken(token string) (*entity.RefreshToken, error) {
	return s.refreshTokenRepo.GetByToken(token)
}

// GenerateJWT gera um novo token JWT para o usuário
func (s *Service) GenerateJWT(user *entity.User) (string, error) {
	claims := TokenClaims{
		UserID: user.ID,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.tokenExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		logger.Error("Erro ao gerar JWT", err)
		return "", err
	}

	return signedToken, nil
}

// ValidateJWT valida um token JWT
func (s *Service) ValidateJWT(tokenString string) (*TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de assinatura inesperado: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		logger.Error("Erro ao validar JWT", err)
		return nil, ErrInvalidToken
	}

	if !token.Valid {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*TokenClaims)
	if !ok {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// GenerateRefreshToken gera um novo token de atualização
func (s *Service) GenerateRefreshToken(userID int64) (*entity.RefreshToken, error) {
	// Gera um token aleatório de 32 bytes
	tokenBytes := make([]byte, 32)
	_, err := rand.Read(tokenBytes)
	if err != nil {
		logger.Error("Erro ao gerar bytes aleatórios para refresh token", err)
		return nil, err
	}

	// Converte para base64
	tokenString := base64.URLEncoding.EncodeToString(tokenBytes)

	// Obtém a duração da expiração do refresh token
	refreshExpiryStr := os.Getenv("REFRESH_TOKEN_EXPIRY")
	refreshExpiry, err := time.ParseDuration(refreshExpiryStr)
	if err != nil {
		logger.Warning("REFRESH_TOKEN_EXPIRY inválido ou não definido, usando 7 dias como padrão", err)
		refreshExpiry = 7 * 24 * time.Hour // 7 dias
	}

	// Cria o token de atualização
	refreshToken := entity.NewRefreshToken(userID, tokenString, refreshExpiry)

	// Persiste o token
	err = s.refreshTokenRepo.Create(refreshToken)
	if err != nil {
		logger.Error("Erro ao persistir refresh token", err)
		return nil, err
	}

	return refreshToken, nil
}

// RefreshAccessToken gera um novo token de acesso a partir de um refresh token
func (s *Service) RefreshAccessToken(refreshTokenStr string, userEmail string) (string, *entity.RefreshToken, error) {
	// Busca o refresh token no repositório
	refreshToken, err := s.refreshTokenRepo.GetByToken(refreshTokenStr)
	if err != nil {
		logger.Error("Erro ao buscar refresh token", err)
		return "", nil, ErrInvalidToken
	}

	// Verifica se o token é válido
	if !refreshToken.IsValid || refreshToken.IsExpired() {
		logger.Warning("Tentativa de usar refresh token inválido ou expirado", map[string]interface{}{
			"token":   refreshTokenStr,
			"valid":   refreshToken.IsValid,
			"expired": refreshToken.IsExpired(),
		})
		return "", nil, ErrInvalidToken
	}

	// Cria um "usuário" temporário apenas para gerar o JWT
	user := &entity.User{
		ID:    refreshToken.UserID,
		Email: userEmail,
	}

	// Gera um novo token JWT
	newJWT, err := s.GenerateJWT(user)
	if err != nil {
		return "", nil, err
	}

	// Gera um novo refresh token
	newRefreshToken, err := s.GenerateRefreshToken(user.ID)
	if err != nil {
		return "", nil, err
	}

	// Invalida o refresh token anterior
	err = s.refreshTokenRepo.Invalidate(refreshTokenStr)
	if err != nil {
		logger.Error("Erro ao invalidar refresh token anterior", err)
		// Não falha a operação se não conseguir invalidar o token anterior
	}

	return newJWT, newRefreshToken, nil
}

// InvalidateAllTokensForUser invalida todos os tokens de atualização para um usuário
func (s *Service) InvalidateAllTokensForUser(userID int64) error {
	return s.refreshTokenRepo.InvalidateAllForUser(userID)
}
