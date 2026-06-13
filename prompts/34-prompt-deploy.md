Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Docker, PostgreSQL, Redis, Prisma ORM, CI/CD e deploy de APIs em cloud.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Node.js + TypeScript
- Express
- PostgreSQL
- Redis
- Prisma ORM
- Docker
- Swagger
- Testes
- CI/CD
- Health Check avançado
- Backup e Restore
- API Versioning com /api/v1

Nesta tarefa, quero preparar o projeto para deploy em cloud.

Objetivo:

Criar documentação e ajustes necessários para publicar a API em uma plataforma cloud como Render, Railway, Fly.io ou VPS.

Tarefas:

1. Criar docs/deploy.md.
2. Documentar variáveis de ambiente de produção.
3. Documentar comandos de build.
4. Documentar comando de start.
5. Documentar execução de migrations em produção.
6. Criar checklist de deploy.
7. Criar checklist de segurança antes do deploy.
8. Criar exemplo de configuração para Render/Railway.
9. Garantir que Swagger fique acessível em produção.
10. Garantir que health check use /api/v1/health/ready.
11. Atualizar README apontando para docs/deploy.md.

Variáveis esperadas:

NODE_ENV=production
PORT=3333
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
CACHE_TTL_SECONDS=

Critérios de aceitação:

1. docs/deploy.md criado.
2. README atualizado.
3. Health check documentado.
4. Migrations em produção documentadas.
5. Variáveis de ambiente documentadas.
6. Checklist de segurança criado.
7. pnpm lint passa.
8. pnpm typecheck passa.

Commit esperado:

docs: add cloud deployment guide
