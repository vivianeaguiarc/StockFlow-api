Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, APIs REST, versionamento de APIs, arquitetura backend e boas práticas de manutenção.

Estou construindo a StockFlow API.

O projeto já possui:

- Auth com access token, refresh token e logout
- RBAC
- Multi-Tenancy
- Audit Logs
- Rate Limiting
- Redis Cache
- Swagger
- Testes
- Docker
- CI/CD

Objetivo:

Implementar versionamento de API para preparar o projeto para evolução futura sem quebrar clientes existentes.

Tarefas:

1. Criar prefixo global /api/v1.
2. Manter compatibilidade temporária com /api, se fizer sentido.
3. Atualizar roteador principal.
4. Atualizar Swagger para documentar /api/v1.
5. Atualizar Postman Collection, se existir.
6. Atualizar testes E2E.
7. Atualizar README.
8. Não alterar regras de negócio.

Rotas esperadas após versionamento:

GET /api/v1/health

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

GET /api/v1/me

GET /api/v1/companies/me
PATCH /api/v1/companies/me

GET /api/v1/users
POST /api/v1/users

GET /api/v1/products
POST /api/v1/products

GET /api/v1/dashboard/summary

Critérios de aceitação:

1. Todas as rotas devem funcionar com /api/v1.
2. Swagger deve apontar para /api/v1.
3. Testes devem passar.
4. README deve ser atualizado.
5. pnpm lint passa.
6. pnpm typecheck passa.
7. pnpm test passa.

Commit esperado:

refactor(api): add v1 route versioning
