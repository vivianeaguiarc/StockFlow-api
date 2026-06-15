Você é um engenheiro backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Clean Architecture, APIs REST, segurança com JWT/RBAC, métricas de negócio, performance, Redis, Swagger/OpenAPI e sistemas de gestão de estoque.

Implemente a Tarefa 59 no projeto StockFlow-api: criar dashboard de métricas do estoque.

Contexto:
O projeto já possui:

- módulo de produtos
- movimentações de estoque
- histórico de movimentações
- alertas de estoque baixo
- autenticação JWT
- RBAC
- Redis
- Swagger/OpenAPI
- respostas padronizadas

Objetivo:
Criar endpoint de dashboard para fornecer uma visão geral do estoque.

Requisitos:

1. Criar endpoint:

GET /api/v1/dashboard/stock

2. Aplicar RBAC:
   - ADMIN e MANAGER podem consultar o dashboard.
   - USER não deve acessar, salvo se o projeto já permitir dashboards para USER.

3. Retornar métricas:

{
"totalProducts": 100,
"activeProducts": 90,
"inactiveProducts": 10,
"lowStockProducts": 8,
"totalStockQuantity": 1250,
"totalInventoryValue": 45890.50,
"recentMovements": []
}

4. recentMovements deve retornar as últimas 5 movimentações:
   - id
   - productId
   - productName
   - type
   - quantity
   - previousQuantity
   - newQuantity
   - userId
   - userEmail
   - createdAt

5. Considerar apenas produtos com deletedAt null nas métricas principais.

6. Calcular:
   - totalInventoryValue = soma de price \* quantity

7. Adicionar cache Redis:
   - dashboard:stock
   - TTL de 60 segundos
   - invalidar quando produto for criado, atualizado, deletado ou movimentado.

8. Padronizar resposta conforme contrato atual da API.

9. Atualizar Swagger/OpenAPI:
   - StockDashboardResponse
   - RecentStockMovement
   - erros 401, 403 e 500

10. Criar testes para:

- retornar métricas corretas
- ignorar produtos deletados
- contar produtos ativos e inativos
- calcular produtos em estoque baixo
- calcular valor total do estoque
- retornar últimas 5 movimentações
- RBAC
- cache e invalidação

11. Executar:

- npm run lint
- npm run test
- npm run build

12. Não reescrever a arquitetura inteira. Seguir o padrão modular atual do projeto.
