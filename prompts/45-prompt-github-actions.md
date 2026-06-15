Você é um engenheiro DevOps e backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Docker, GitHub Actions, CI/CD, testes automatizados com Vitest e boas práticas de pipelines para APIs REST.

Implemente a Tarefa 46 no projeto StockFlow-api: configurar pipeline de CI/CD com GitHub Actions.

Contexto:
O projeto já possui:

- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Docker e Docker Compose
- JWT
- RBAC
- Refresh Token
- Audit Logs
- Testes automatizados
- Swagger
- Rate Limit
- Soft Delete
- Paginação e filtros

Objetivo:
Criar uma pipeline profissional para validar automaticamente qualidade, testes e build da API em pull requests e pushes.

Requisitos:

1. Criar o arquivo:

.github/workflows/ci.yml

2. A pipeline deve executar em:
   - pull_request
   - push nas branches main e develop

3. Usar Node.js LTS.

4. Instalar dependências com npm ci.

5. Subir PostgreSQL como service container no GitHub Actions.

6. Configurar variáveis de ambiente de teste:
   - NODE_ENV=test
   - DATABASE_URL
   - JWT_ACCESS_SECRET
   - JWT_REFRESH_SECRET
   - outras variáveis obrigatórias do projeto

7. Executar validações nesta ordem:
   - npm run lint
   - npx prisma generate
   - npx prisma migrate deploy
   - npm run test
   - npm run build

8. Se existir script de coverage, executar:
   - npm run test:coverage

9. Adicionar cache de dependências do npm.

10. Garantir que a pipeline falhe se:

- lint quebrar
- migration falhar
- testes falharem
- build falhar

11. Criar badge de status no README:

![CI](badge do GitHub Actions)

12. Não incluir secrets reais no repositório.

13. Usar apenas valores fake/seguros no workflow.

14. Validar localmente antes de commitar:

- npm run lint
- npm run test
- npm run build

15. Manter o padrão atual do projeto sem reescrever arquitetura.
