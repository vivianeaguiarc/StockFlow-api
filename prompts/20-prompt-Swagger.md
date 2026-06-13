Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Swagger/OpenAPI, documentação de APIs REST e boas práticas backend.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Auth Module
- JWT Authentication
- RBAC
- Company Module
- Users Module
- Categories Module
- Suppliers Module
- Products Module
- Inventory Movements
- Audit Logs
- Prisma ORM
- PostgreSQL
- Error Handler global
- Zod validation
- Multi-Tenancy

Nesta tarefa, quero configurar documentação Swagger/OpenAPI para a API.

Objetivo:

Documentar as rotas já implementadas para facilitar testes, demonstração no portfólio e uso por outros desenvolvedores.

Tarefas:

1. Instalar swagger-ui-express.
2. Instalar swagger-jsdoc.
3. Instalar tipos necessários.
4. Criar configuração Swagger.
5. Criar rota /api/docs.
6. Documentar autenticação Bearer JWT.
7. Documentar os módulos já existentes:
   - Health
   - Auth
   - Current User
   - Companies
   - Users
   - Categories
   - Suppliers
   - Products
   - Inventory
   - Audit
8. Documentar schemas principais.
9. Documentar respostas de sucesso.
10. Documentar respostas de erro.
11. Atualizar app.ts para usar Swagger.
12. Não alterar regras de negócio.

Estrutura esperada:

src/
├── docs/
│ └── swagger.ts

Rota esperada:

GET /api/docs

Critérios de aceitação:

1. /api/docs deve abrir a documentação Swagger.
2. Rotas protegidas devem exibir Bearer Auth.
3. Schemas principais devem aparecer na documentação.
4. pnpm lint deve passar.
5. pnpm typecheck deve passar.
6. A API deve continuar funcionando normalmente.

Ao finalizar:

- Mostre os arquivos criados ou alterados.
- Explique como acessar a documentação.
- Explique como usar o token JWT no Swagger.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

docs: add swagger api documentation
