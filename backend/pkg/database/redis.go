package database

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"github.com/redis/go-redis/v9"
	"github.com/whatsapp/backend/internal/logger"
)

// NewRedisConnection cria uma nova conexão com o Redis
func NewRedisConnection() (*redis.Client, error) {
	host := os.Getenv("REDIS_HOST")
	portStr := os.Getenv("REDIS_PORT")
	password := os.Getenv("REDIS_PASS")
	dbStr := os.Getenv("REDIS_DB")

	// Converter porta para inteiro
	port, err := strconv.Atoi(portStr)
	if err != nil {
		logger.Warning("REDIS_PORT inválido, usando porta padrão 6379", err)
		port = 6379
	}

	// Converter DB para inteiro
	db, err := strconv.Atoi(dbStr)
	if err != nil {
		logger.Warning("REDIS_DB inválido, usando DB 0", err)
		db = 0
	}

	// Configuração do cliente Redis
	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", host, port),
		Password: password,
		DB:       db,
	})

	// Verificar conexão
	err = client.Ping(context.Background()).Err()
	if err != nil {
		logger.Error("Falha ao conectar ao Redis", err)
		return nil, err
	}

	logger.Info("Conexão com o Redis estabelecida com sucesso")
	return client, nil
}
