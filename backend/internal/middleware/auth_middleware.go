package middleware

import (
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/whatsapp/backend/internal/auth"
	"github.com/whatsapp/backend/internal/logger"
)

// AuthMiddleware é um middleware para verificar a autenticação
type AuthMiddleware struct {
	authService *auth.Service
}

// NewAuthMiddleware cria uma nova instância do middleware de autenticação
func NewAuthMiddleware(authService *auth.Service) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
	}
}

// RequireAuth verifica se o usuário está autenticado
func (m *AuthMiddleware) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extrair token da requisição
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			// Adicionar atraso aleatório para dificultar timing attacks
			time.Sleep(time.Duration(100+rand.Intn(200)) * time.Millisecond)
			logger.Warning("Requisição sem token de autorização")
			http.Error(w, "Autenticação necessária", http.StatusUnauthorized)
			return
		}

		// Verificar formato do token
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			// Adicionar atraso aleatório para dificultar timing attacks
			time.Sleep(time.Duration(100+rand.Intn(200)) * time.Millisecond)
			logger.Warning("Formato de token inválido", map[string]interface{}{"header": authHeader})
			http.Error(w, "Autenticação inválida", http.StatusUnauthorized)
			return
		}

		tokenString := tokenParts[1]

		// Validar token
		claims, err := m.authService.ValidateJWT(tokenString)
		if err != nil {
			// Adicionar atraso aleatório para dificultar timing attacks
			time.Sleep(time.Duration(100+rand.Intn(200)) * time.Millisecond)

			if err == auth.ErrExpiredToken {
				logger.Warning("Token expirado")
				http.Error(w, "Autenticação expirada", http.StatusUnauthorized)
				return
			}
			logger.Warning("Token inválido", err)
			http.Error(w, "Autenticação inválida", http.StatusUnauthorized)
			return
		}

		// Adicionar claims ao contexto da requisição
		ctx := r.Context()
		ctx = auth.WithUserID(ctx, claims.UserID)
		ctx = auth.WithEmail(ctx, claims.Email)

		// Prosseguir com a requisição
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
