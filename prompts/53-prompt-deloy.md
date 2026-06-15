Você é um engenheiro backend/DevOps sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Docker, Render, CI/CD, segurança de variáveis de ambiente, health checks e deploy profissional de APIs REST.

Implemente a Tarefa 53 no projeto StockFlow-api: profissionalizar o deploy já existente no Render.

Contexto:
A API já está publicada em produção no Render:
https://stockflow-api-l4x4.onrender.com/api/docs/

Objetivo:
Melhorar a configuração, documentação e confiabilidade do deploy existente, sem recriar o projeto do zero.

Requisitos:

1. Revisar configurações de produção:
   - NODE_ENV=production
   - PORT
   - DATABASE_URL
   - JWT_ACCESS_SECRET
   - JWT_REFRESH_SECRET
   - CORS_ORIGIN
   - RATE_LIMIT_ENABLED
   - REDIS_URL, se Redis estiver ativo

2. Criar ou revisar render.yaml, se fizer sentido para o projeto.

3. Documentar no README:
   - URL de produção
   - URL do Swagger
   - health check
   - readiness check
   - variáveis de ambiente obrigatórias
   - comando de build
   - comando de start
   - comando de migrations em produção

4. Garantir que o Swagger tenha server de produção:
   - https://stockflow-api-l4x4.onrender.com/api/v1

5. Garantir endpoints:
   - GET /api/v1/health
   - GET /api/v1/ready

6. Configurar ou documentar health check do Render usando:
   /api/v1/health

7. Garantir suporte a proxy:
   - app.set("trust proxy", 1)

8. Garantir que secrets reais não estejam versionados.

9. Revisar .env.example com variáveis necessárias, sem valores reais.

10. Garantir script para migrations em produção:

- npm run db:migrate:deploy

11. Validar localmente:

- npm run lint
- npm run test
- npm run build

12. Não alterar regras de negócio.
