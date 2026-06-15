Você é um engenheiro backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Redis, Docker, observabilidade, performance de APIs REST, segurança e arquitetura para sistemas escaláveis.

Implemente a Tarefa 48 no projeto StockFlow-api: adicionar camada de cache utilizando Redis.

Contexto:
O projeto já possui:

- Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT + RBAC
- Refresh Token
- Audit Logs
- Soft Delete
- Paginação
- Filtros
- Docker
- GitHub Actions
- Observabilidade
- Health Checks
- Testes automatizados

Objetivo:
Reduzir consultas repetidas ao banco de dados e preparar a API para cenários de maior volume de acesso.

Requisitos:

1. Adicionar Redis ao projeto.

2. Configurar conexão centralizada:
   - src/shared/cache
   - ou seguir o padrão arquitetural já existente.

3. Adicionar Redis ao docker-compose.

4. Criar serviço de cache:
   - get
   - set
   - del
   - delByPattern

5. Implementar cache inicialmente nas consultas:
   - GET /users
   - GET /users/:id
   - GET /auth/me

6. Criar chave padronizada:

users:list:{hash}
users:id:{id}
auth:me:{userId}

7. Definir TTL:
   - listagens → 60 segundos
   - detalhes → 300 segundos

8. Invalidar cache automaticamente quando:
   - usuário for criado
   - usuário for atualizado
   - usuário sofrer soft delete

9. Implementar fallback:
   - se Redis estiver indisponível, a API continua funcionando normalmente utilizando apenas PostgreSQL.

10. Criar logs:

- cache hit
- cache miss
- cache invalidation

11. Atualizar Health Check:

- incluir status do Redis no endpoint /ready

12. Atualizar Docker:

- adicionar serviço redis
- volume persistente

13. Criar testes:

- cache hit
- cache miss
- invalidação
- fallback sem Redis

14. Atualizar README:

- Redis
- Docker Compose
- Variáveis de ambiente

15. Executar:

- npm run lint
- npm run test
- npm run build
