Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, APIs REST, métricas de negócio, dashboards, Multi-Tenancy e RBAC.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Auth Module
- JWT Authentication
- RBAC
- Multi-Tenancy
- Users
- Categories
- Suppliers
- Products
- Inventory Movements
- Audit Logs
- Paginação, ordenação e filtros
- Swagger
- Testes automatizados
- Docker
- CI/CD
- Observabilidade

Nesta tarefa, quero criar o módulo Dashboard.

Objetivo:

Criar endpoints de métricas consolidadas para o painel administrativo da empresa logada.

Tarefas:

1. Criar módulo dashboard.
2. Criar DashboardController.
3. Criar DashboardService.
4. Criar dashboard.routes.ts.
5. Registrar rotas no roteador principal.
6. Proteger todas as rotas com authenticate.
7. Aplicar RBAC.
8. Aplicar multi-tenancy usando req.user.companyId.
9. Criar endpoint de resumo geral.
10. Criar endpoint de produtos com estoque baixo.
11. Criar endpoint de movimentações recentes.
12. Atualizar Swagger.
13. Criar ou atualizar testes E2E.

Estrutura esperada:

src/
├── modules/
│ └── dashboard/
│ ├── controllers/
│ │ └── DashboardController.ts
│ ├── routes/
│ │ └── dashboard.routes.ts
│ └── services/
│ └── DashboardService.ts

Rotas:

GET /api/dashboard/summary
GET /api/dashboard/low-stock-products
GET /api/dashboard/recent-movements

Regras de permissão:

GET /api/dashboard/summary:

- ADMIN
- MANAGER

GET /api/dashboard/low-stock-products:

- ADMIN
- MANAGER
- EMPLOYEE

GET /api/dashboard/recent-movements:

- ADMIN
- MANAGER

Resumo esperado:

{
"totalUsers": 10,
"totalCategories": 8,
"totalSuppliers": 5,
"totalProducts": 120,
"activeProducts": 110,
"inactiveProducts": 10,
"lowStockProducts": 7,
"totalInventoryMovements": 350,
"entriesToday": 20,
"exitsToday": 12,
"adjustmentsToday": 2
}

Low stock products:

Retornar produtos onde:

quantity <= minimumStock

Campos:

- id
- name
- sku
- quantity
- minimumStock
- category
- supplier

Recent movements:

Retornar últimas movimentações de estoque da empresa.

Campos:

- id
- type
- quantity
- previousQuantity
- newQuantity
- reason
- createdAt
- product
- user

Regras de negócio:

1. Todas as consultas devem filtrar por companyId.
2. Não retornar dados de outra empresa.
3. Não considerar registros deletados.
4. Considerar apenas produtos não deletados nas métricas.
5. Low stock deve considerar quantity <= minimumStock.
6. Recent movements deve retornar no máximo 10 registros por padrão.
7. Permitir query param limit em recent-movements, com máximo 50.
8. Métricas do dia devem considerar o dia atual.
9. Não expor passwordHash em usuários retornados.
10. EMPLOYEE pode ver low-stock-products, mas não summary nem recent-movements.

Critérios de aceitação:

1. GET /api/dashboard/summary retorna métricas da empresa logada.
2. GET /api/dashboard/low-stock-products retorna apenas produtos da empresa logada.
3. GET /api/dashboard/recent-movements retorna apenas movimentações da empresa logada.
4. EMPLOYEE recebe 403 em summary.
5. EMPLOYEE recebe 403 em recent-movements.
6. EMPLOYEE consegue acessar low-stock-products.
7. Multi-tenancy validado.
8. Swagger atualizado.
9. Testes E2E passando.
10. pnpm lint passa.
11. pnpm typecheck passa.
12. pnpm test passa.

Ao finalizar:

- Mostre arquivos criados ou alterados.
- Explique as métricas criadas.
- Explique como o multi-tenancy foi aplicado.
- Explique como testar no Swagger/Postman.
- Sugira commit seguindo Conventional Commits.

Commit esperado:

feat(dashboard): add company metrics endpoints
