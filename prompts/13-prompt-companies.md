Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Prisma ORM, APIs REST, multi-tenancy, RBAC e segurança.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Auth Module
- Register/Login JWT
- Middleware authenticate
- Middleware authorizeRoles
- req.user tipado
- Prisma ORM
- PostgreSQL
- Error Handler global
- Health Module

Nesta tarefa, quero criar o módulo Companies.

Objetivo:

Permitir que uma empresa autenticada consulte e atualize seus próprios dados, respeitando multi-tenancy e RBAC.

Tarefas:

1. Criar módulo companies.
2. Criar CompaniesController.
3. Criar CompaniesService.
4. Criar companies.routes.ts.
5. Criar DTO de atualização com Zod.
6. Criar rota GET /api/companies/me.
7. Criar rota PATCH /api/companies/me.
8. Proteger as rotas com authenticate.
9. Permitir PATCH apenas para ADMIN.
10. Nunca permitir acessar empresa de outro companyId.
11. Não permitir atualizar document nesta tarefa.
12. Não retornar dados deletados.
13. Não criar products ainda.

Estrutura esperada:

src/
├── modules/
│ └── companies/
│ ├── controllers/
│ │ └── CompaniesController.ts
│ ├── dtos/
│ │ └── update-company.dto.ts
│ ├── routes/
│ │ └── companies.routes.ts
│ └── services/
│ └── CompaniesService.ts

Rotas:

GET /api/companies/me

PATCH /api/companies/me

Payload PATCH:

{
"name": "New Company Name",
"email": "new-email@example.com",
"phone": "+5532999999999"
}

Regras de negócio:

1. Usuário autenticado só pode ver a própria empresa.
2. Usuário autenticado só pode atualizar a própria empresa.
3. Apenas ADMIN pode atualizar empresa.
4. document não pode ser atualizado.
5. email duplicado deve retornar 409.
6. Empresa inativa ou deletada deve retornar 404 ou 401 conforme contexto.
7. Não retornar campos sensíveis desnecessários.

Critérios de aceitação:

1. GET /api/companies/me retorna a empresa do req.user.companyId.
2. PATCH /api/companies/me atualiza somente a empresa do usuário.
3. PATCH bloqueia MANAGER e EMPLOYEE com 403.
4. PATCH aceita ADMIN.
5. Email duplicado retorna 409.
6. Token inválido retorna 401.
7. pnpm lint passa.
8. pnpm typecheck passa.

Ao finalizar:

- Mostre arquivos criados ou alterados.
- Explique como o multi-tenancy foi aplicado.
- Explique por que usamos /me em vez de /companies/:id.
- Explique como testar no Insomnia/Postman.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

feat(companies): add company profile endpoints
