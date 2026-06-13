Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, pnpm, GitHub Actions, CI/CD, PostgreSQL, Prisma, Docker e qualidade de código.

Estou construindo a StockFlow API.

O projeto já possui:

- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Docker Compose
- ESLint
- Prettier
- Vitest
- Supertest
- Testes E2E
- Swagger
- Conventional Commits

Nesta tarefa, quero configurar CI/CD inicial com GitHub Actions.

Objetivo:

Criar pipeline de integração contínua para validar automaticamente o projeto a cada push e pull request.

Tarefas:

1. Criar workflow em .github/workflows/ci.yml.
2. Configurar Node.js.
3. Configurar pnpm.
4. Instalar dependências com pnpm install.
5. Subir PostgreSQL como service no GitHub Actions.
6. Configurar DATABASE_URL para ambiente de teste.
7. Rodar Prisma generate.
8. Rodar migrations.
9. Rodar lint.
10. Rodar format:check.
11. Rodar typecheck.
12. Rodar testes.
13. Garantir que o pipeline rode em push e pull_request.

Scripts esperados no pipeline:

pnpm install --frozen-lockfile
pnpm db:generate
pnpm prisma migrate deploy
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test

Critérios de aceitação:

1. Workflow roda em push.
2. Workflow roda em pull_request.
3. PostgreSQL sobe no GitHub Actions.
4. Prisma conecta no banco.
5. Migrations executam com sucesso.
6. Lint passa.
7. Format check passa.
8. Typecheck passa.
9. Testes passam.
10. Não versionar segredos reais.

Commit esperado:

ci: add github actions workflow
