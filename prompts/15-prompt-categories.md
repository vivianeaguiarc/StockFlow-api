Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Prisma ORM, APIs REST, RBAC, Multi-Tenancy e Clean Code.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Auth Module
- JWT Authentication
- RBAC
- Company Module
- Users Module
- Prisma ORM
- PostgreSQL
- Error Handler global
- Zod validation

Objetivo:

Criar o módulo Categories para permitir que cada empresa gerencie suas próprias categorias de produtos.

Tarefas:

1. Atualizar o schema.prisma criando o model Category.
2. Criar migration para Category.
3. Criar módulo categories.
4. Criar CategoriesController.
5. Criar CategoriesService.
6. Criar categories.routes.ts.
7. Criar DTOs com Zod.
8. Registrar rotas no roteador principal.
9. Proteger todas as rotas com authenticate.
10. Aplicar RBAC conforme regras abaixo.
11. Aplicar multi-tenancy usando req.user.companyId.

Model Category:

- id
- companyId
- name
- description
- status
- createdAt
- updatedAt
- deletedAt
- company

Enum CategoryStatus:

- ACTIVE
- INACTIVE

Rotas:

POST /api/categories
GET /api/categories
GET /api/categories/:id
PATCH /api/categories/:id
DELETE /api/categories/:id

Regras de permissão:

POST:

- ADMIN
- MANAGER

GET:

- ADMIN
- MANAGER
- EMPLOYEE

GET BY ID:

- ADMIN
- MANAGER
- EMPLOYEE

PATCH:

- ADMIN
- MANAGER

DELETE:

- ADMIN

Regras de negócio:

1. Categoria pertence a uma empresa.
2. companyId nunca deve vir do body.
3. companyId deve vir sempre do req.user.companyId.
4. Uma empresa não pode acessar categoria de outra empresa.
5. Nome da categoria deve ser único por empresa.
6. Não retornar categorias com deletedAt preenchido.
7. DELETE deve ser soft delete.
8. Ao deletar, definir deletedAt e status INACTIVE.
9. Não permitir atualizar categoria deletada.
10. Não permitir criar categoria com nome vazio.

Critérios de aceitação:

1. POST /api/categories cria categoria para a empresa logada.
2. GET /api/categories lista apenas categorias da empresa logada.
3. GET /api/categories/:id não permite acessar categoria de outra empresa.
4. PATCH atualiza apenas categoria da empresa logada.
5. DELETE faz soft delete.
6. EMPLOYEE não pode criar, editar ou deletar.
7. MANAGER não pode deletar.
8. Nome duplicado na mesma empresa retorna 409.
9. pnpm db:migrate deve funcionar.
10. pnpm lint deve passar.
11. pnpm typecheck deve passar.

Ao finalizar:

- Mostre os arquivos criados ou alterados.
- Explique o model Category.
- Explique como o multi-tenancy foi aplicado.
- Explique as regras de RBAC.
- Explique como testar no Insomnia/Postman.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

feat(categories): implement category management module
