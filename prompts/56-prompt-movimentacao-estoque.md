Você é um engenheiro backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Clean Architecture, APIs REST, segurança com JWT/RBAC, auditoria, testes automatizados e sistemas de gestão de estoque.

Implemente a Tarefa 56 no projeto StockFlow-api: criar movimentações de estoque para produtos.

Contexto:
O projeto já possui autenticação, RBAC, refresh token, soft delete, paginação, filtros, audit logs, Redis, Swagger, CI/CD, Docker, observabilidade, segurança avançada, deploy no Render, padronização de respostas e módulo de produtos.

Objetivo:
Permitir registrar entradas, saídas e ajustes de estoque com rastreabilidade.

Requisitos:

1. Criar enum StockMovementType:
   - IN
   - OUT
   - ADJUSTMENT

2. Criar model StockMovement:
   - id String @id @default(uuid())
   - productId String
   - userId String
   - type StockMovementType
   - quantity Int
   - previousQuantity Int
   - newQuantity Int
   - reason String?
   - createdAt DateTime @default(now())

3. Relacionar:
   - Product possui stockMovements
   - User possui stockMovements

4. Criar migration:
   npx prisma migrate dev --name add-stock-movements

5. Criar endpoint:
   POST /api/v1/products/:productId/stock-movements

6. Regras:
   - IN soma quantity ao estoque atual.
   - OUT subtrai quantity do estoque atual.
   - ADJUSTMENT define o estoque para o valor informado.
   - OUT não pode deixar estoque negativo.
   - quantity deve ser maior que zero.
   - produto deletado não pode receber movimentação.

7. Aplicar RBAC:
   - ADMIN e MANAGER podem movimentar estoque.
   - USER não pode movimentar estoque.

8. Registrar audit log:
   - CREATE_STOCK_MOVEMENT

9. Invalidar cache:
   - products:list
   - products:id:{productId}

10. Padronizar resposta conforme contrato atual da API.

11. Atualizar Swagger:

- CreateStockMovementRequest
- StockMovementResponse
- erros 400, 401, 403, 404 e 409

12. Criar testes para:

- entrada de estoque
- saída de estoque
- saída com estoque insuficiente
- ajuste de estoque
- produto inexistente
- produto deletado
- RBAC
- audit log
- invalidação de cache

13. Executar:

- npx prisma generate
- npm run lint
- npm run test
- npm run build

14. Não reescrever a arquitetura inteira. Seguir o padrão modular atual do projeto.
