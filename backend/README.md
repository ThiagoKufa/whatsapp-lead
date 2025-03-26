# Backend - Sistema de Login com Refresh Token

Este é o backend do sistema de login que implementa autenticação com JWT e refresh tokens.

## Tecnologias Utilizadas

- Go 1.21+
- Chi (Router)
- PostgreSQL (Banco de dados)
- Redis (Cache)
- JWT para autenticação

## Configuração

1. Clone o repositório
2. Instale as dependências:

```bash
cd backend
go mod tidy
```

3. Configure o arquivo .env:

```env
# Já configurado com valores padrão para desenvolvimento
```

4. Configure o banco de dados PostgreSQL e Redis

5. Execute o servidor:

```bash
go run cmd/api/main.go
```

## Estrutura do Projeto

```
backend/
├── cmd/                # Pontos de entrada da aplicação
│   └── api/            # API REST
├── config/             # Configurações
├── internal/           # Código interno da aplicação
│   ├── auth/           # Serviço de autenticação
│   ├── handlers/       # Manipuladores HTTP
│   ├── logger/         # Sistema de log
│   ├── middleware/     # Middlewares
│   ├── models/         # Modelos de dados
│   │   └── entity/     # Entidades
│   └── repository/     # Camada de acesso a dados
└── pkg/                # Código reutilizável
    └── database/       # Conexões com bancos de dados
```

## Endpoints

### Autenticação

- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovação de token
- `POST /api/auth/logout` - Logout (requer autenticação)

### Rotas Protegidas

- `GET /api/me` - Obter informações do usuário (requer autenticação)

## Sistema de Log

O sistema implementa logs em dois níveis:

1. **Logs de Erro**: Salvos em arquivos JSON na pasta `logs/` para facilitar a depuração
2. **Logs Gerais**: Exibidos no console

## Segurança

- Senhas armazenadas com hash bcrypt
- Tokens JWT com expiração curta (15 minutos por padrão)
- Refresh tokens com expiração mais longa (7 dias por padrão)
- Invalidação de tokens no logout 