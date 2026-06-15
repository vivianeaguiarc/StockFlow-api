Você é um engenheiro backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Clean Architecture, APIs REST, segurança com JWT/RBAC, auditoria, rastreabilidade, paginação, filtros, Swagger/OpenAPI e sistemas de gestão de estoque.

Implemente a Tarefa 57 no projeto StockFlow-api: criar consulta de histórico de movimentações de estoque.

Contexto:
O projeto já possui módulo de produtos e criação de movimentações de estoque com os tipos IN, OUT e ADJUSTMENT.

Objetivo:
Permitir consultar o histórico completo de movimentações de estoque com paginação, filtros e rastreabilidade.

Requisitos:

1. Criar endpoint:

GET /api/v1/stock-movements

2. Criar endpoint:

GET /api/v1/products/:productId/stock-movements

3. Aplicar RBAC:
   - ADMIN e MANAGER podem consultar todo o histórico.
   - USER pode consultar histórico, se o projeto permitir consulta de produtos para USER.
   - Se preferir regra mais restrita, permitir apenas ADMIN e MANAGER.

4. Implementar paginação:
   - page
   - limit

5. Implementar filtros:
   - productId
   - userId
   - type
   - startDate
   - endDate

6. Ordenar por padrão:
   - createdAt desc

7. Retornar dados úteis:
   - id
   - productId
   - productName
   - userId
   - userName ou userEmail
   - type
   - quantity
   - previousQuantity
   - newQuantity
   - reason
   - createdAt

8. Validar:
   - type deve aceitar apenas IN, OUT ou ADJUSTMENT
   - startDate e endDate devem ser datas válidas
   - productId, se informado, deve existir

9. Padronizar resposta conforme contrato atual da API.

10. Atualizar Swagger/OpenAPI:

- StockMovement
- PaginatedStockMovementsResponse
- query params
- respostas 200, 400, 401, 403 e 404

11. Criar testes para:

- listar histórico geral
- listar histórico por produto
- filtrar por tipo
- filtrar por período
- paginação
- ordenação por createdAt desc
- RBAC
- productId inexistente

12. Executar:

- npm run lint
- npm run test
- npm run build

13. Não reescrever a arquitetura inteira. Seguir o padrão modular atual do projeto.
