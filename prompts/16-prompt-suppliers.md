Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Prisma ORM, APIs REST, RBAC, Multi-Tenancy e Clean Code.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Auth Module
- JWT Authentication
- RBAC
- Company Module
- Users Module
- Categories Module
- Prisma ORM
- PostgreSQL
- Error Handler global
- Zod validation

Nesta tarefa, quero criar o módulo Suppliers para permitir que cada empresa gerencie seus próprios fornecedores.

Objetivo:

Criar CRUD completo de fornecedores com autenticação, autorização, validação, soft delete e isolamento por empresa.

Tarefas:

1. Atualizar o schema.prisma criando o model Supplier.
2. Criar migration para Supplier.
3. Criar módulo suppliers.
4. Criar SuppliersController.
5. Criar SuppliersService.
6. Criar suppliers.routes.ts.
7. Criar DTOs com Zod.
8. Registrar rotas no roteador principal.
9. Proteger todas as rotas com authenticate.
10. Aplicar RBAC.
11. Aplicar multi-tenancy usando req.user.companyId.

Model Supplier:

- id
- companyId
- corporateName
- tradeName
- document
- email
- phone
- status
- createdAt
- updatedAt
- deletedAt
- company

Enum SupplierStatus:

- ACTIVE
- INACTIVE

Rotas:

POST /api/suppliers
GET /api/suppliers
GET /api/suppliers/:id
PATCH /api/suppliers/:id
DELETE /api/suppliers/:id

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

1. Fornecedor pertence a uma empresa.
2. companyId nunca deve vir do body.
3. companyId deve vir sempre do req.user.companyId.
4. Uma empresa não pode acessar fornecedor de outra empresa.
5. document deve ser único por empresa.
6. email deve ser único por empresa, se informado.
7. Não retornar fornecedores com deletedAt preenchido.
8. DELETE deve ser soft delete.
9. Ao deletar, definir deletedAt e status INACTIVE.
10. Não permitir atualizar fornecedor deletado.
11. Não permitir criar fornecedor com corporateName vazio.
12. Não permitir criar fornecedor com document vazio.

Critérios de aceitação:

1. POST /api/suppliers cria fornecedor para a empresa logada.
2. GET /api/suppliers lista apenas fornecedores da empresa logada.
3. GET /api/suppliers/:id não permite acessar fornecedor de outra empresa.
4. PATCH atualiza apenas fornecedor da empresa logada.
5. DELETE faz soft delete.
6. EMPLOYEE não pode criar, editar ou deletar.
7. MANAGER não pode deletar.
8. Documento duplicado na mesma empresa retorna 409.
9. pnpm db:migrate deve funcionar.
10. pnpm lint deve passar.
11. pnpm typecheck deve passar.

Ao finalizar:

- Mostre os arquivos criados ou alterados.
- Explique o model Supplier.
- Explique como o multi-tenancy foi aplicado.
- Explique as regras de RBAC.
- Explique como testar no Insomnia/Postman.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

feat(suppliers): implement supplier management module
