Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Prisma ORM, RBAC, Multi-Tenancy e APIs REST.

Estou construindo a StockFlow API.

O projeto já possui:

- Auth Module
- JWT
- RBAC
- Company Profile
- Prisma ORM
- PostgreSQL

Objetivo:

Criar o módulo Users para gerenciamento dos usuários da empresa.

Tarefas:

1. Criar módulo users.
2. Criar UsersController.
3. Criar UsersService.
4. Criar users.routes.ts.
5. Criar DTOs usando Zod.
6. Utilizar bcryptjs para senha.
7. Respeitar Multi-Tenancy.
8. Utilizar RBAC.

Rotas:

POST /api/users

GET /api/users

GET /api/users/:id

PATCH /api/users/:id

DELETE /api/users/:id

Regras:

POST:

- Apenas ADMIN.
- Criar MANAGER ou EMPLOYEE.
- Não permitir criar ADMIN nesta versão.

GET LIST:

- ADMIN e MANAGER.

GET BY ID:

- ADMIN e MANAGER.

PATCH:

- Apenas ADMIN.

DELETE:

- Soft Delete.
- Apenas ADMIN.

Regras de negócio:

1. Usuário só pode enxergar usuários da própria empresa.
2. companyId deve vir do token.
3. Não aceitar companyId vindo do body.
4. Email deve ser único globalmente.
5. Senha deve ser salva como hash.
6. Não retornar passwordHash.
7. Não permitir excluir o último ADMIN da empresa.
8. Não permitir excluir a si próprio.
9. deletedAt deve ser usado para exclusão lógica.

Critérios:

1. Multi-tenancy funcionando.
2. RBAC funcionando.
3. Soft Delete funcionando.
4. pnpm lint passando.
5. pnpm typecheck passando.

Ao finalizar:

- Explicar arquitetura.
- Explicar regras de negócio.
- Explicar proteção multiempresa.
- Sugerir commit.

Commit esperado:

feat(users): implement user management module
