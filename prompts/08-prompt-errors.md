Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Clean Architecture, tratamento de erros, APIs REST e segurança.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Node.js
- TypeScript
- Express
- PostgreSQL com Docker
- Prisma ORM configurado
- Seed inicial
- Camada HTTP organizada com app.ts, server.ts e routes.ts
- ESLint
- Prettier
- Husky
- lint-staged
- commitlint

Nesta tarefa, quero criar o tratamento centralizado de erros da API.

Objetivo:

Padronizar respostas de erro da aplicação usando uma classe AppError e um middleware global de error handler.

Tarefas:

1. Criar src/shared/errors/AppError.ts.
2. Criar src/shared/http/middlewares/error-handler.ts.
3. Configurar o errorHandler no app.ts depois das rotas.
4. Criar tratamento para erros conhecidos da aplicação.
5. Criar tratamento genérico para erros inesperados.
6. Garantir que a API nunca exponha stack trace em produção.
7. Manter compatibilidade com Express e TypeScript.
8. Não criar regras de negócio ainda.
9. Não criar autenticação ainda.

Estrutura esperada:

src/
├── shared/
│ ├── errors/
│ │ └── AppError.ts
│ └── http/
│ └── middlewares/
│ └── error-handler.ts

AppError deve ter:

- message
- statusCode

Formato esperado de erro:

{
"status": "error",
"message": "Mensagem do erro"
}

Critérios de aceitação:

1. AppError deve permitir lançar erros com status HTTP customizado.
2. errorHandler deve tratar AppError corretamente.
3. errorHandler deve tratar erros inesperados com status 500.
4. app.ts deve usar o errorHandler depois das rotas.
5. pnpm lint deve passar.
6. pnpm typecheck deve passar.
7. A API deve continuar respondendo GET /health.

Ao finalizar:

- Mostre os arquivos criados ou alterados.
- Explique a responsabilidade da classe AppError.
- Explique a responsabilidade do errorHandler.
- Explique por que o middleware deve vir depois das rotas.
- Explique como testar.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

feat: add global error handler
