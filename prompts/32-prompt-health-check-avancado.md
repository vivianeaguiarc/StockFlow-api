Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Prisma ORM, Redis, Docker, observabilidade e APIs prontas para produção.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Node.js + TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Redis Cache
- Docker
- JWT + Refresh Token
- RBAC
- Multi-Tenancy
- Audit Logs
- Dashboard
- Swagger
- Testes E2E
- CI/CD
- Observabilidade
- API Versioning com /api/v1

Nesta tarefa, quero evoluir o módulo Health para um padrão mais profissional.

Objetivo:

Criar health checks avançados para diferenciar disponibilidade da API, prontidão para receber tráfego e detalhes dos serviços dependentes.

Tarefas:

1. Atualizar módulo health existente.
2. Criar endpoint GET /api/v1/health/live.
3. Criar endpoint GET /api/v1/health/ready.
4. Criar endpoint GET /api/v1/health/details.
5. Verificar conexão com PostgreSQL usando Prisma.
6. Verificar conexão com Redis.
7. Retornar versão da aplicação.
8. Retornar ambiente atual.
9. Retornar uptime da aplicação.
10. Retornar timestamp.
11. Atualizar Swagger.
12. Atualizar testes E2E.

Rotas esperadas:

GET /api/v1/health/live
GET /api/v1/health/ready
GET /api/v1/health/details

Regras:

1. /live deve apenas informar se a aplicação está viva.
2. /ready deve validar se dependências essenciais estão funcionando.
3. /details deve retornar informações detalhadas de PostgreSQL, Redis, uptime, version e environment.
4. Se PostgreSQL falhar, /ready deve retornar status 503.
5. Se Redis falhar, /details deve informar redis como down.
6. Não expor dados sensíveis.
7. Não exigir autenticação nessas rotas.
8. Manter compatibilidade com GET /api/v1/health, se já existir.

Exemplo /live:

{
"status": "ok",
"timestamp": "2026-06-13T00:00:00.000Z"
}

Exemplo /ready:

{
"status": "ready",
"services": {
"database": "up",
"redis": "up"
}
}

Exemplo /details:

{
"status": "healthy",
"version": "1.0.0",
"environment": "development",
"uptime": 120,
"services": {
"database": {
"status": "up"
},
"redis": {
"status": "up"
}
},
"timestamp": "2026-06-13T00:00:00.000Z"
}

Critérios de aceitação:

1. GET /api/v1/health/live retorna 200.
2. GET /api/v1/health/ready retorna 200 quando PostgreSQL e Redis estiverem disponíveis.
3. GET /api/v1/health/ready retorna 503 se PostgreSQL estiver indisponível.
4. GET /api/v1/health/details retorna status dos serviços.
5. Swagger atualizado.
6. Testes E2E atualizados.
7. pnpm lint passa.
8. pnpm typecheck passa.
9. pnpm test passa.

Ao finalizar:

- Mostre arquivos criados ou alterados.
- Explique diferença entre live, ready e details.
- Explique como testar manualmente.
- Sugira commit seguindo Conventional Commits.

Commit esperado:

feat(health): add advanced health checks
