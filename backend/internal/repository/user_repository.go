package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/whatsapp/backend/internal/logger"
	"github.com/whatsapp/backend/internal/models/entity"
)

// UserRepository é responsável pelas operações de banco de dados relacionadas aos usuários
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository cria uma nova instância do repositório de usuários
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// Create insere um novo usuário no banco de dados
func (r *UserRepository) Create(user *entity.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		INSERT INTO users (name, email, password, created_at, updated_at) 
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		user.Name,
		user.Email,
		user.Password,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.ID)

	if err != nil {
		logger.Error("Erro ao criar usuário no banco de dados", err)
		return err
	}

	return nil
}

// GetByID busca um usuário pelo ID
func (r *UserRepository) GetByID(id int64) (*entity.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		SELECT id, name, email, password, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &entity.User{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			logger.Warning("Usuário não encontrado", map[string]interface{}{"id": id})
			return nil, err
		}
		logger.Error("Erro ao buscar usuário no banco de dados", err)
		return nil, err
	}

	return user, nil
}

// GetByEmail busca um usuário pelo email
func (r *UserRepository) GetByEmail(email string) (*entity.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		SELECT id, name, email, password, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &entity.User{}
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			logger.Warning("Usuário não encontrado com o email", map[string]interface{}{"email": email})
			return nil, err
		}
		logger.Error("Erro ao buscar usuário por email no banco de dados", err)
		return nil, err
	}

	return user, nil
}

// Update atualiza os dados de um usuário
func (r *UserRepository) Update(user *entity.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user.UpdatedAt = time.Now()

	query := `
		UPDATE users
		SET name = $1, email = $2, password = $3, updated_at = $4
		WHERE id = $5
	`

	_, err := r.db.ExecContext(
		ctx,
		query,
		user.Name,
		user.Email,
		user.Password,
		user.UpdatedAt,
		user.ID,
	)

	if err != nil {
		logger.Error("Erro ao atualizar usuário no banco de dados", err)
		return err
	}

	return nil
}

// Delete remove um usuário do banco de dados
func (r *UserRepository) Delete(id int64) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
		DELETE FROM users
		WHERE id = $1
	`

	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		logger.Error("Erro ao excluir usuário do banco de dados", err)
		return err
	}

	return nil
}
