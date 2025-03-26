package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/whatsapp/backend/internal/logger"
	"github.com/whatsapp/backend/internal/models/entity"
)

// RefreshTokenRepository é responsável pelas operações de banco de dados relacionadas aos tokens de atualização
type RefreshTokenRepository struct {
	db *sql.DB
}

// NewRefreshTokenRepository cria uma nova instância do repositório de tokens
func NewRefreshTokenRepository(db *sql.DB) *RefreshTokenRepository {
	return &RefreshTokenRepository{
		db: db,
	}
}

// Create insere um novo token de atualização no banco de dados
func (r *RefreshTokenRepository) Create(token *entity.RefreshToken) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		INSERT INTO refresh_tokens (user_id, token, expires_at, created_at, is_valid) 
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		token.UserID,
		token.Token,
		token.ExpiresAt,
		token.CreatedAt,
		token.IsValid,
	).Scan(&token.ID)

	if err != nil {
		logger.Error("Erro ao criar refresh token no banco de dados", err)
		return err
	}

	return nil
}

// GetByToken busca um token de atualização pelo valor do token
func (r *RefreshTokenRepository) GetByToken(token string) (*entity.RefreshToken, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		SELECT id, user_id, token, expires_at, created_at, is_valid
		FROM refresh_tokens
		WHERE token = $1
	`

	refreshToken := &entity.RefreshToken{}
	err := r.db.QueryRowContext(ctx, query, token).Scan(
		&refreshToken.ID,
		&refreshToken.UserID,
		&refreshToken.Token,
		&refreshToken.ExpiresAt,
		&refreshToken.CreatedAt,
		&refreshToken.IsValid,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			logger.Warning("Refresh token não encontrado", map[string]interface{}{"token": token})
			return nil, err
		}
		logger.Error("Erro ao buscar refresh token no banco de dados", err)
		return nil, err
	}

	return refreshToken, nil
}

// Invalidate marca um token como inválido
func (r *RefreshTokenRepository) Invalidate(token string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		UPDATE refresh_tokens
		SET is_valid = false
		WHERE token = $1
	`

	_, err := r.db.ExecContext(ctx, query, token)
	if err != nil {
		logger.Error("Erro ao invalidar refresh token no banco de dados", err)
		return err
	}

	return nil
}

// InvalidateAllForUser invalida todos os tokens de um usuário específico
func (r *RefreshTokenRepository) InvalidateAllForUser(userID int64) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		UPDATE refresh_tokens
		SET is_valid = false
		WHERE user_id = $1
	`

	_, err := r.db.ExecContext(ctx, query, userID)
	if err != nil {
		logger.Error("Erro ao invalidar todos os refresh tokens do usuário", err)
		return err
	}

	return nil
}
