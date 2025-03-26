package database

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/whatsapp/backend/internal/logger"
)

// NewPostgresConnection cria uma nova conexão com o banco de dados PostgreSQL
func NewPostgresConnection() (*sql.DB, error) {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASS")
	dbname := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSL_MODE")

	// Construir a string de conexão
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	// Abrir a conexão com o banco de dados
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		logger.Error("Falha ao conectar ao banco de dados", err)
		return nil, err
	}

	// Verificar conexão
	err = db.Ping()
	if err != nil {
		logger.Error("Falha ao pingar o banco de dados", err)
		return nil, err
	}

	// Configurar pool de conexões
	maxConnectionsStr := os.Getenv("DB_MAX_CONNECTIONS")
	maxIdleConnectionsStr := os.Getenv("DB_MAX_IDLE_CONNECTIONS")
	maxLifetimeStr := os.Getenv("DB_MAX_LIFETIME")

	maxConnections, err := strconv.Atoi(maxConnectionsStr)
	if err != nil || maxConnections <= 0 {
		logger.Warning("DB_MAX_CONNECTIONS inválido, usando valor padrão", err)
		maxConnections = 10
	}

	maxIdleConnections, err := strconv.Atoi(maxIdleConnectionsStr)
	if err != nil || maxIdleConnections <= 0 {
		logger.Warning("DB_MAX_IDLE_CONNECTIONS inválido, usando valor padrão", err)
		maxIdleConnections = 5
	}

	maxLifetime, err := time.ParseDuration(maxLifetimeStr)
	if err != nil {
		logger.Warning("DB_MAX_LIFETIME inválido, usando valor padrão", err)
		maxLifetime = 5 * time.Minute
	}

	db.SetMaxOpenConns(maxConnections)
	db.SetMaxIdleConns(maxIdleConnections)
	db.SetConnMaxLifetime(maxLifetime)

	logger.Info("Conexão com o banco de dados estabelecida com sucesso")
	return db, nil
}

// MigrateTables cria as tabelas necessárias se não existirem
func MigrateTables(db *sql.DB) error {
	// Criar tabela de usuários
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			email VARCHAR(100) NOT NULL UNIQUE,
			password VARCHAR(100) NOT NULL,
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL
		)
	`)
	if err != nil {
		logger.Error("Erro ao criar tabela de usuários", err)
		return err
	}

	// Criar tabela de tokens de atualização
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS refresh_tokens (
			id SERIAL PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			token VARCHAR(255) NOT NULL UNIQUE,
			expires_at TIMESTAMP NOT NULL,
			created_at TIMESTAMP NOT NULL,
			is_valid BOOLEAN NOT NULL DEFAULT TRUE
		)
	`)
	if err != nil {
		logger.Error("Erro ao criar tabela de refresh tokens", err)
		return err
	}

	logger.Info("Migração de tabelas concluída com sucesso")
	return nil
}
