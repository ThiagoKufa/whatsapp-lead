package entity

import (
	"time"
)

// RefreshToken representa um token de atualização no sistema
type RefreshToken struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
	IsValid   bool      `json:"is_valid"`
}

// IsExpired verifica se o token já expirou
func (rt *RefreshToken) IsExpired() bool {
	return time.Now().After(rt.ExpiresAt)
}

// Invalidate marca o token como inválido
func (rt *RefreshToken) Invalidate() {
	rt.IsValid = false
}

// NewRefreshToken cria um novo token de atualização
func NewRefreshToken(userID int64, token string, expiresIn time.Duration) *RefreshToken {
	return &RefreshToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(expiresIn),
		CreatedAt: time.Now(),
		IsValid:   true,
	}
}
