Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Redis, performance, cache, Prisma ORM, APIs REST, Multi-Tenancy e boas práticas backend.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- JWT Authentication
- RBAC
- Multi-Tenancy
- Users
- Categories
- Suppliers
- Products
- Inventory Movements
- Audit Logs
- Dashboard
- Paginação, filtros e ordenação
- Rate Limiting
- Swagger
- Testes
- Docker
- CI/CD
- Observabilidade

Nesta tarefa, quero adicionar Redis para cache de consultas pesadas.

Objetivo:

Melhorar performance em endpoints de leitura, principalmente Dashboard e listagens de produtos, usando cache com Redis.

Tarefas:

1. Adicionar Redis no docker-compose.yml.
2. Instalar biblioteca Redis para Node.js.
3. Criar cliente Redis centralizado.
4. Criar CacheService reutilizável.
5. Criar funções get, set, del e delByPattern.
6. Configurar TTL padrão.
7. Cachear endpoints do Dashboard.
8. Cachear listagem de produtos.
9. Invalidar cache quando produtos forem criados, atualizados ou removidos.
10. Invalidar cache quando movimentações de estoque forem criadas.
11. Garantir isolamento por companyId nas chaves de cache.
12. Atualizar .env.example.
13. Atualizar README, se necessário.
14. Atualizar testes, se possível.

Dependências sugeridas:

- redis

Estrutura esperada:

src/
├── shared/
│ └── cache/
│ ├── redis-client.ts
│ └── CacheService.ts

Variáveis de ambiente:

REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=300

Padrão de chave:

stockflow:{companyId}:dashboard:summary
stockflow:{companyId}:dashboard:low-stock-products
stockflow:{companyId}:dashboard:recent-movements
stockflow:{companyId}:products:list:{queryHash}

Regras importantes:

1. Cache nunca pode misturar dados entre empresas.
2. Toda chave deve conter companyId.
3. Dados sensíveis não devem ser cacheados.
4. Não cachear login.
5. Não cachear register.
6. Não cachear dados de usuários.
7. Cache deve falhar de forma segura.
8. Se Redis estiver fora, API deve continuar funcionando buscando no PostgreSQL.
9. Invalidar cache de dashboard após movimentação de estoque.
10. Invalidar cache de produtos após criação, atualização, exclusão e movimentação.

Critérios de aceitação:

1. Redis sobe com docker compose.
2. API conecta ao Redis.
3. Dashboard usa cache.
4. Products list usa cache.
5. Cache respeita companyId.
6. Cache é invalidado após alteração de produto.
7. Cache é invalidado após movimentação de estoque.
8. Se Redis cair, API continua respondendo.
9. pnpm lint passa.
10. pnpm typecheck passa.
11. pnpm test passa.

Ao finalizar:

- Mostre arquivos criados ou alterados.
- Explique como o Redis foi configurado.
- Explique o padrão das chaves.
- Explique como a invalidação funciona.
- Explique como testar cache manualmente.
- Sugira commit seguindo Conventional Commits.

Commit esperado:

feat(cache): add redis caching
