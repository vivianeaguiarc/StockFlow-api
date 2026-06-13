Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Vitest, Supertest, Prisma ORM, PostgreSQL, testes automatizados e qualidade de software.

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
- Prisma ORM
- PostgreSQL
- Error Handler global
- Zod validation
- ESLint, Prettier, Husky, lint-staged e commitlint

Nesta tarefa, quero configurar testes automatizados para a API.

Objetivo:

Configurar Vitest e Supertest para testar endpoints HTTP da aplicação de forma automatizada.

Tarefas:

1. Instalar Vitest.
2. Instalar Supertest.
3. Instalar tipos do Supertest.
4. Criar configuração vitest.config.ts.
5. Criar pasta de testes.
6. Criar teste inicial para GET /api/health.
7. Criar teste inicial para POST /api/auth/register.
8. Criar teste inicial para POST /api/auth/login.
9. Garantir que app.ts possa ser importado nos testes sem subir o servidor.
10. Garantir que server.ts continue responsável apenas por app.listen.
11. Criar script test no package.json.
12. Criar script test:watch no package.json.
13. Criar script test:coverage no package.json.
14. Não alterar regra de negócio existente.

Dependências:

- vitest
- supertest
- @types/supertest
- @vitest/coverage-v8

Estrutura esperada:

src/
├── app.ts
├── server.ts

tests/
├── e2e/
│ ├── health.e2e.test.ts
│ └── auth.e2e.test.ts
└── setup.ts

Scripts esperados:

pnpm test
pnpm test:watch
pnpm test:coverage

Critérios de aceitação:

1. pnpm test deve executar os testes.
2. GET /api/health deve retornar 200.
3. POST /api/auth/register deve criar empresa e usuário admin.
4. POST /api/auth/login deve retornar accessToken.
5. Testes não devem depender de servidor rodando manualmente.
6. Testes devem importar app.ts diretamente.
7. pnpm lint deve passar.
8. pnpm typecheck deve passar.

Regras importantes:

- Usar describe, it, expect do Vitest.
- Usar request(app) do Supertest.
- Não usar Jest.
- Não usar any.
- Evitar testes frágeis.
- Usar dados únicos nos testes para evitar conflito de email/document.
- Não testar todos os módulos nesta tarefa; apenas configurar base.

Ao finalizar:

- Mostre arquivos criados ou alterados.
- Explique a diferença entre teste unitário, integração e E2E.
- Explique por que app.ts é importado nos testes.
- Explique como rodar os testes.
- Sugira commit seguindo Conventional Commits.

Commit esperado:

test: configure automated tests
