# Frontend - Sistema de Login com Refresh Token

Este é o frontend do sistema de login que implementa autenticação com JWT e refresh tokens.

## Tecnologias Utilizadas

- React 19
- TypeScript
- Material UI
- React Router DOM
- React Hook Form
- Zod para validação
- Axios para requisições HTTP

## Configuração

1. Clone o repositório
2. Instale as dependências:

```bash
cd frontend
pnpm install
```

3. Configure a URL da API no arquivo `src/services/api.ts` se necessário.

4. Execute o servidor de desenvolvimento:

```bash
pnpm dev
```

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   │   └── auth/       # Componentes relacionados à autenticação
│   ├── contexts/       # Contextos React
│   ├── hooks/          # Hooks personalizados
│   ├── pages/          # Componentes de página
│   ├── services/       # Serviços (API, etc)
│   ├── types/          # Definições de tipos TypeScript
│   ├── utils/          # Utilitários diversos
│   ├── App.tsx         # Componente raiz
│   └── main.tsx        # Ponto de entrada
└── public/             # Arquivos estáticos
```

## Funcionalidades

- Login com email e senha
- Cadastro de novos usuários
- Renovação automática de token (refresh token)
- Rotas protegidas com autenticação
- Validação de formulários
- Interface responsiva

## Rotas

- `/auth` - Página de login/cadastro
- `/` - Página inicial (protegida)
