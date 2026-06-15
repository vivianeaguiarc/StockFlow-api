Você é um engenheiro backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Swagger/OpenAPI 3.0, documentação de APIs REST, segurança com JWT Bearer Token e boas práticas para APIs profissionais.

Implemente a Tarefa 49 no projeto StockFlow-api: evoluir a documentação Swagger/OpenAPI para um padrão profissional.

Contexto:
O projeto já possui:

- Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT + RBAC
- Refresh Token + Logout
- Audit Logs
- Soft Delete
- Paginação e filtros
- Docker
- GitHub Actions
- Observabilidade
- Health Checks
- Redis Cache

Objetivo:
Transformar a documentação da API em uma documentação clara, organizada e útil para frontend, QA, recrutadores e outros desenvolvedores.

Requisitos:

1. Revisar a configuração principal do Swagger/OpenAPI.

2. Garantir que a documentação use OpenAPI 3.0.

3. Organizar as rotas por tags:
   - Auth
   - Users
   - Health
   - Audit
   - Cache, se existir endpoint relacionado

4. Configurar corretamente o security scheme:
   - BearerAuth
   - JWT no formato Bearer Token

5. Documentar schemas reutilizáveis em components/schemas:
   - User
   - CreateUserRequest
   - UpdateUserRequest
   - LoginRequest
   - LoginResponse
   - RefreshTokenRequest
   - RefreshTokenResponse
   - ErrorResponse
   - PaginationMeta
   - PaginatedUsersResponse
   - HealthResponse
   - ReadyResponse

6. Documentar respostas padronizadas:
   - 200
   - 201
   - 204
   - 400
   - 401
   - 403
   - 404
   - 409
   - 429
   - 500

7. Adicionar exemplos reais e seguros para:
   - criação de usuário
   - login
   - refresh token
   - listagem paginada
   - filtros por name, email e role
   - erros de validação
   - erro de permissão

8. Garantir que nenhuma resposta exponha:
   - password
   - passwordHash
   - refreshToken salvo no banco
   - secrets
   - dados sensíveis desnecessários

9. Documentar query params:
   - page
   - limit
   - name
   - email
   - role

10. Documentar headers relevantes:

- Authorization
- x-request-id

11. Documentar endpoints:

- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- GET /api/v1/auth/me
- GET /api/v1/users
- GET /api/v1/users/:id
- PATCH/PUT /api/v1/users/:id, se existir
- DELETE /api/v1/users/:id
- GET /api/v1/health
- GET /api/v1/ready

12. Se existir versão pública em produção, ajustar servers:

- local
- production

13. Melhorar título e descrição da API:

- Nome: StockFlow API
- Descrever como API REST para gestão de usuários, autenticação, segurança e base para controle de estoque.

14. Atualizar README com link da documentação Swagger.

15. Garantir que a documentação continue funcionando em:

- ambiente local
- Docker
- produção

16. Criar ou ajustar testes, se o projeto já testa Swagger:

- rota /api/docs responde 200
- JSON OpenAPI responde corretamente, se existir endpoint para isso

17. Executar:

- npm run lint
- npm run test
- npm run build

18. Manter o padrão atual do projeto sem reescrever a arquitetura inteira.
