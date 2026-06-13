Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Vitest, Supertest, Prisma ORM, PostgreSQL, testes E2E, RBAC e Multi-Tenancy.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Auth Module
- JWT Authentication
- RBAC
- Companies
- Users
- Categories
- Suppliers
- Products
- Inventory Movements
- Audit Logs
- Swagger/OpenAPI
- Vitest
- Supertest
- Prisma ORM
- PostgreSQL

Nesta tarefa, quero ampliar a cobertura de testes E2E para os principais módulos da API.

Objetivo:

Criar testes automatizados para validar autenticação, autorização, multi-tenancy e CRUDs principais.

Módulos a testar:

- Companies
- Users
- Categories
- Suppliers
- Products
- Inventory Movements

Tarefas:

1. Criar helpers de teste.
2. Criar factory para registrar empresa e admin.
3. Criar helper para login e geração de token.
4. Criar testes para Companies.
5. Criar testes para Users.
6. Criar testes para Categories.
7. Criar testes para Suppliers.
8. Criar testes para Products.
9. Criar testes para Inventory Movements.
10. Garantir dados únicos por teste.
11. Garantir limpeza do banco entre testes, se necessário.
12. Não testar Swagger nesta tarefa.
13. Não testar Audit Logs nesta tarefa.

Estrutura esperada:

tests/
├── e2e/
│ ├── companies.e2e.test.ts
│ ├── users.e2e.test.ts
│ ├── categories.e2e.test.ts
│ ├── suppliers.e2e.test.ts
│ ├── products.e2e.test.ts
│ └── inventory.e2e.test.ts
│
└── helpers/
├── auth-helper.ts
├── test-data.ts
└── cleanup.ts

Critérios de aceitação:

1. Testar rotas protegidas sem token retornando 401.
2. Testar permissões RBAC retornando 403 quando necessário.
3. Testar criação, listagem, busca, atualização e soft delete.
4. Testar que dados de uma empresa não aparecem para outra.
5. Testar produto com categoria e fornecedor válidos.
6. Testar movimentação ENTRY aumentando estoque.
7. Testar movimentação EXIT reduzindo estoque.
8. Testar EXIT sem estoque suficiente retornando erro.
9. pnpm test deve passar.
10. pnpm lint deve passar.
11. pnpm typecheck deve passar.

Regras importantes:

- Usar Vitest.
- Usar Supertest.
- Não usar Jest.
- Não usar any.
- Usar dados únicos com Date.now ou crypto.randomUUID.
- Evitar dependência entre arquivos de teste.
- Cada teste deve preparar seus próprios dados.
- Testes devem importar app.ts diretamente.
- Não depender de servidor rodando manualmente.

Ao finalizar:

- Mostre arquivos criados ou alterados.
- Explique os helpers criados.
- Explique como os testes validam multi-tenancy.
- Explique como os testes validam RBAC.
- Explique como rodar.
- Sugira commit seguindo Conventional Commits.

Commit esperado:

test: add e2e tests for core modules
