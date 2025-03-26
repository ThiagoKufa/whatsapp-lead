package auth

import (
	"context"
)

type contextKey string

const (
	userIDKey contextKey = "user_id"
	emailKey  contextKey = "email"
)

// WithUserID adiciona o ID do usuário ao contexto
func WithUserID(ctx context.Context, userID int64) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

// GetUserID obtém o ID do usuário do contexto
func GetUserID(ctx context.Context) (int64, bool) {
	userID, ok := ctx.Value(userIDKey).(int64)
	return userID, ok
}

// WithEmail adiciona o email do usuário ao contexto
func WithEmail(ctx context.Context, email string) context.Context {
	return context.WithValue(ctx, emailKey, email)
}

// GetEmail obtém o email do usuário do contexto
func GetEmail(ctx context.Context) (string, bool) {
	email, ok := ctx.Value(emailKey).(string)
	return email, ok
}
