package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"math/rand"
	"net/http"
	"time"

	"github.com/whatsapp/backend/internal/auth"
	"github.com/whatsapp/backend/internal/logger"
	"github.com/whatsapp/backend/internal/models/entity"
	"github.com/whatsapp/backend/internal/repository"
)

// AuthHandler gerencia as rotas de autenticação
type AuthHandler struct {
	userRepo    *repository.UserRepository
	authService *auth.Service
}

// RegisterRequest representa os dados para registro de usuário
type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginRequest representa os dados para login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RefreshTokenRequest representa os dados para renovação de token
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// AuthResponse representa a resposta de autenticação
type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	TokenType    string `json:"token_type"`
}

// NewAuthHandler cria uma nova instância do manipulador de autenticação
func NewAuthHandler(userRepo *repository.UserRepository, authService *auth.Service) *AuthHandler {
	return &AuthHandler{
		userRepo:    userRepo,
		authService: authService,
	}
}

// Register registra um novo usuário
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		logger.Error("Erro ao decodificar corpo da requisição", err)
		http.Error(w, "Formato de requisição inválido", http.StatusBadRequest)
		return
	}

	// Validações básicas
	if req.Name == "" || req.Email == "" || req.Password == "" {
		http.Error(w, "Todos os campos são obrigatórios", http.StatusBadRequest)
		return
	}

	// Verificar se o email já existe
	_, err = h.userRepo.GetByEmail(req.Email)
	if err == nil {
		// Adicionando um pequeno atraso para dificultar enumeração de emails
		time.Sleep(time.Duration(200+rand.Intn(300)) * time.Millisecond)
		logger.Warning("Tentativa de registro com email já existente", map[string]interface{}{"email": req.Email})
		// Resposta genérica para não confirmar que o email existe
		http.Error(w, "Erro ao processar solicitação", http.StatusConflict)
		return
	} else if !errors.Is(err, sql.ErrNoRows) {
		logger.Error("Erro ao verificar email existente", err)
		http.Error(w, "Erro ao processar solicitação", http.StatusInternalServerError)
		return
	}

	// Criar novo usuário
	user, err := entity.NewUser(req.Name, req.Email, req.Password)
	if err != nil {
		logger.Error("Erro ao criar novo usuário", err)
		http.Error(w, "Erro ao processar solicitação", http.StatusInternalServerError)
		return
	}

	// Salvar usuário no banco
	err = h.userRepo.Create(user)
	if err != nil {
		logger.Error("Erro ao salvar usuário no banco", err)
		http.Error(w, "Erro ao processar solicitação", http.StatusInternalServerError)
		return
	}

	// Gerar tokens
	accessToken, err := h.authService.GenerateJWT(user)
	if err != nil {
		logger.Error("Erro ao gerar JWT", err)
		http.Error(w, "Erro ao gerar token de acesso", http.StatusInternalServerError)
		return
	}

	refreshToken, err := h.authService.GenerateRefreshToken(user.ID)
	if err != nil {
		logger.Error("Erro ao gerar refresh token", err)
		http.Error(w, "Erro ao gerar token de atualização", http.StatusInternalServerError)
		return
	}

	// Preparar resposta
	resp := AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken.Token,
		ExpiresIn:    int64(h.authService.GetTokenExpiry().Seconds()),
		TokenType:    "Bearer",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// Login autentica um usuário
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		logger.Error("Erro ao decodificar corpo da requisição", err)
		http.Error(w, "Formato de requisição inválido", http.StatusBadRequest)
		return
	}

	// Validações básicas
	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email e senha são obrigatórios", http.StatusBadRequest)
		return
	}

	// Buscar usuário pelo email
	user, err := h.userRepo.GetByEmail(req.Email)

	// Adicionar um atraso para dificultar ataques de força bruta
	// O atraso é aplicado antes da verificação para evitar timing attacks
	time.Sleep(time.Duration(300+rand.Intn(400)) * time.Millisecond)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			logger.Warning("Tentativa de login com email não cadastrado", map[string]interface{}{"email": req.Email})
			http.Error(w, "Credenciais inválidas", http.StatusUnauthorized)
			return
		}
		logger.Error("Erro ao buscar usuário por email", err)
		http.Error(w, "Erro ao processar solicitação", http.StatusInternalServerError)
		return
	}

	// Verificar senha
	if !user.ComparePassword(req.Password) {
		logger.Warning("Tentativa de login com senha incorreta", map[string]interface{}{"email": req.Email})
		http.Error(w, "Credenciais inválidas", http.StatusUnauthorized)
		return
	}

	// Gerar tokens
	accessToken, err := h.authService.GenerateJWT(user)
	if err != nil {
		logger.Error("Erro ao gerar JWT", err)
		http.Error(w, "Erro ao gerar token de acesso", http.StatusInternalServerError)
		return
	}

	refreshToken, err := h.authService.GenerateRefreshToken(user.ID)
	if err != nil {
		logger.Error("Erro ao gerar refresh token", err)
		http.Error(w, "Erro ao gerar token de atualização", http.StatusInternalServerError)
		return
	}

	// Preparar resposta
	resp := AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken.Token,
		ExpiresIn:    int64(h.authService.GetTokenExpiry().Seconds()),
		TokenType:    "Bearer",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// RefreshToken renova o token de acesso usando um refresh token
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req RefreshTokenRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		logger.Error("Erro ao decodificar corpo da requisição", err)
		http.Error(w, "Formato de requisição inválido", http.StatusBadRequest)
		return
	}

	// Validações básicas
	if req.RefreshToken == "" {
		http.Error(w, "Token de atualização é obrigatório", http.StatusBadRequest)
		return
	}

	// Extrair informações do token atual para obter o email
	tokenString := r.Header.Get("Authorization")
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	var userEmail string
	if tokenString != "" {
		claims, _ := h.authService.ValidateJWT(tokenString)
		if claims != nil {
			userEmail = claims.Email
		}
	}

	// Se não conseguir extrair o email do token atual, buscar pelo ID do usuário no refresh token
	if userEmail == "" {
		refreshToken, err := h.authService.GetRefreshTokenByToken(req.RefreshToken)
		if err == nil {
			user, err := h.userRepo.GetByID(refreshToken.UserID)
			if err == nil {
				userEmail = user.Email
			}
		}
	}

	// Renovar tokens
	newAccessToken, newRefreshToken, err := h.authService.RefreshAccessToken(req.RefreshToken, userEmail)
	if err != nil {
		// Adicionar atraso para dificultar ataques de força bruta em tokens
		time.Sleep(time.Duration(200+rand.Intn(300)) * time.Millisecond)

		if errors.Is(err, auth.ErrInvalidToken) || errors.Is(err, auth.ErrExpiredToken) {
			logger.Warning("Tentativa de usar refresh token inválido", map[string]interface{}{"token": req.RefreshToken})
			http.Error(w, "Autenticação inválida", http.StatusUnauthorized)
			return
		}
		logger.Error("Erro ao renovar tokens", err)
		http.Error(w, "Erro ao processar solicitação", http.StatusInternalServerError)
		return
	}

	// Preparar resposta
	resp := AuthResponse{
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken.Token,
		ExpiresIn:    int64(h.authService.GetTokenExpiry().Seconds()),
		TokenType:    "Bearer",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Logout invalida todos os tokens de atualização do usuário
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// Extrair claims do token
	tokenString := r.Header.Get("Authorization")
	if len(tokenString) <= 7 || tokenString[:7] != "Bearer " {
		http.Error(w, "Autenticação necessária", http.StatusBadRequest)
		return
	}
	tokenString = tokenString[7:]

	claims, err := h.authService.ValidateJWT(tokenString)
	if err != nil {
		// Atraso para evitar timing attacks
		time.Sleep(time.Duration(200+rand.Intn(200)) * time.Millisecond)

		if errors.Is(err, auth.ErrExpiredToken) {
			// Mesmo com token expirado, tentar invalidar os refresh tokens
			var req RefreshTokenRequest
			if err = json.NewDecoder(r.Body).Decode(&req); err == nil && req.RefreshToken != "" {
				refreshToken, err := h.authService.GetRefreshTokenByToken(req.RefreshToken)
				if err == nil {
					h.authService.InvalidateAllTokensForUser(refreshToken.UserID)
				}
			}
		} else {
			logger.Warning("Tentativa de logout com token inválido", err)
			http.Error(w, "Autenticação inválida", http.StatusUnauthorized)
			return
		}
	} else {
		// Invalidar todos os tokens de atualização do usuário
		err = h.authService.InvalidateAllTokensForUser(claims.UserID)
		if err != nil {
			logger.Error("Erro ao invalidar tokens do usuário", err)
		}
	}

	w.WriteHeader(http.StatusNoContent)
}
