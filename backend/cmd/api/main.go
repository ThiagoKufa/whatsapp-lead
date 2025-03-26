package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"github.com/whatsapp/backend/internal/auth"
	"github.com/whatsapp/backend/internal/handlers"
	"github.com/whatsapp/backend/internal/logger"
	authMiddleware "github.com/whatsapp/backend/internal/middleware"
	"github.com/whatsapp/backend/internal/repository"
	"github.com/whatsapp/backend/pkg/database"
)

func main() {
	// Carregar variáveis de ambiente
	err := godotenv.Load()
	if err != nil {
		logger.Warning("Arquivo .env não encontrado, usando variáveis de ambiente do sistema")
	}

	// Conectar ao banco de dados
	db, err := database.NewPostgresConnection()
	if err != nil {
		logger.Error("Erro ao conectar ao banco de dados", err)
		os.Exit(1)
	}
	defer db.Close()

	// Executar migrações
	err = database.MigrateTables(db)
	if err != nil {
		logger.Error("Erro ao executar migrações", err)
		os.Exit(1)
	}

	// Inicializar repositórios
	userRepo := repository.NewUserRepository(db)
	refreshTokenRepo := repository.NewRefreshTokenRepository(db)

	// Inicializar serviços
	authService := auth.NewAuthService(refreshTokenRepo)

	// Inicializar handlers
	authHandler := handlers.NewAuthHandler(userRepo, authService)

	// Inicializar middlewares
	authMiddlewareInstance := authMiddleware.NewAuthMiddleware(authService)

	// Configurar router
	r := chi.NewRouter()

	// Middlewares globais
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	// Configurar CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Rotas públicas
	r.Group(func(r chi.Router) {
		r.Post("/api/auth/register", authHandler.Register)
		r.Post("/api/auth/login", authHandler.Login)
		r.Post("/api/auth/refresh", authHandler.RefreshToken)
	})

	// Rotas protegidas
	r.Group(func(r chi.Router) {
		r.Use(authMiddlewareInstance.RequireAuth)

		r.Post("/api/auth/logout", authHandler.Logout)

		// Exemplo de rota protegida
		r.Get("/api/me", func(w http.ResponseWriter, r *http.Request) {
			userID, _ := auth.GetUserID(r.Context())
			email, _ := auth.GetEmail(r.Context())

			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(fmt.Sprintf(`{"user_id": %d, "email": "%s"}`, userID, email)))
		})
	})

	// Iniciar servidor
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	logger.Info(fmt.Sprintf("Servidor iniciado na porta %s", port))

	err = http.ListenAndServe(":"+port, r)
	if err != nil {
		logger.Error("Erro ao iniciar servidor", err)
		os.Exit(1)
	}
}
