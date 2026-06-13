Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Clean Architecture, APIs REST e boas práticas backend.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Node.js
- TypeScript
- Express
- PostgreSQL com Docker
- Prisma ORM configurado
- Seed inicial
- ESLint
- Prettier
- Husky
- lint-staged
- commitlint

Nesta tarefa, quero organizar a camada base HTTP da API.

Objetivo:

Separar a criação do app Express do server, criar roteamento centralizado e preparar o projeto para receber módulos como auth, companies, users e products.

Tarefas:

1. Criar src/app.ts.
2. Manter src/server.ts apenas responsável por iniciar o servidor.
3. Criar src/shared/http/routes.ts.
4. Mover a rota GET /health para o roteamento central.
5. Criar middleware global de JSON, CORS e Helmet no app.ts.
6. Criar rota base /api.
7. Manter /health funcionando.
8. Não criar autenticação ainda.
9. Não criar módulos de negócio ainda.

Estrutura esperada:

src/
├── app.ts
├── server.ts
├── shared/
│ └── http/
│ └── routes.ts

Critérios de aceitação:

1. pnpm dev deve iniciar a API.
2. GET /health deve continuar funcionando.
3. GET /api/health pode funcionar também, se decidir padronizar com prefixo.
4. server.ts não deve conter configuração de middlewares.
5. app.ts deve exportar o app.
6. routes.ts deve centralizar as rotas.
7. pnpm lint deve passar.
8. pnpm typecheck deve passar.

Ao finalizar:

- Mostre os arquivos criados ou alterados.
- Explique a responsabilidade de app.ts.
- Explique a responsabilidade de server.ts.
- Explique a responsabilidade de routes.ts.
- Explique como testar.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

refactor: organize http layer
