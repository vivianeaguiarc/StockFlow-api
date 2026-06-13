Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Prisma ORM, APIs REST, paginação, filtros, ordenação e performance.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Auth Module
- JWT Authentication
- RBAC
- Multi-Tenancy
- Companies
- Users
- Categories
- Suppliers
- Products
- Inventory Movements
- Audit Logs
- Swagger
- Testes Automatizados
- Docker
- CI/CD
- Observabilidade

Objetivo:

Implementar paginação, ordenação e filtros nos endpoints de listagem.

Módulos:

- Users
- Categories
- Suppliers
- Products
- Audit Logs

Tarefas:

1. Criar DTOs reutilizáveis para paginação.
2. Criar helper de paginação.
3. Adicionar paginação aos endpoints GET de listagem.
4. Adicionar ordenação.
5. Adicionar filtros.
6. Atualizar documentação Swagger.
7. Atualizar testes E2E.

Estrutura esperada:

src/
├── shared/
│ ├── dtos/
│ │ └── pagination-query.dto.ts
│ ├── types/
│ │ └── paginated-response.ts
│ └── utils/
│ └── pagination.ts

Query params padrão:

?page=1
?pageSize=10
?sortBy=createdAt
?sortOrder=desc

Resposta esperada:

{
"data": [],
"meta": {
"page": 1,
"pageSize": 10,
"totalItems": 100,
"totalPages": 10
}
}

Users:

GET /api/users

Filtros:

?role=ADMIN
?role=MANAGER
?role=EMPLOYEE

?status=ACTIVE
?status=INACTIVE

?search=vivi

Categories:

GET /api/categories

Filtros:

?status=ACTIVE
?status=INACTIVE

?search=eletr

Suppliers:

GET /api/suppliers

Filtros:

?status=ACTIVE
?status=INACTIVE

?search=tech

Products:

GET /api/products

Filtros:

?status=ACTIVE
?status=INACTIVE

?categoryId=...

?supplierId=...

?lowStock=true

?search=notebook

Audit Logs:

GET /api/audit/logs

Filtros:

?action=CREATE
?action=UPDATE
?action=DELETE

?entity=PRODUCT

?userId=...

Regras importantes:

1. Nunca retornar registros deletados.
2. Sempre aplicar companyId.
3. Sempre respeitar Multi-Tenancy.
4. Sempre respeitar RBAC.
5. page mínimo = 1.
6. pageSize máximo = 100.
7. sortOrder apenas asc ou desc.
8. search deve ser case insensitive.
9. Produtos lowStock=true devem retornar:

quantity <= minimumStock

Critérios de aceitação:

1. Paginação funcionando.
2. Ordenação funcionando.
3. Filtros funcionando.
4. Busca funcionando.
5. Swagger atualizado.
6. Testes atualizados.
7. pnpm lint passa.
8. pnpm typecheck passa.
9. pnpm test passa.

Ao finalizar:

- Mostrar arquivos criados.
- Explicar helper de paginação.
- Explicar filtros implementados.
- Explicar impacto em performance.
- Sugerir commit.

Commit esperado:

feat(api): add pagination sorting and filtering
