Você é um engenheiro backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Clean Architecture, APIs REST, segurança com JWT/RBAC, regras de negócio para estoque, auditoria, Swagger/OpenAPI, testes automatizados e performance.

Implemente a Tarefa 58 no projeto StockFlow-api: criar alertas de estoque baixo.

Contexto:
O projeto já possui:

- módulo de produtos
- movimentações de estoque
- histórico de movimentações
- Product com quantity e minimumStock

Objetivo:
Permitir identificar produtos que atingiram ou ficaram abaixo do estoque mínimo.

Requisitos:

1. Criar endpoint:

GET /api/v1/products/low-stock

2. Regra de baixo estoque:
   - produto com quantity <= minimumStock
   - product.deletedAt deve ser null
   - product.active deve ser true

3. Aplicar RBAC:
   - ADMIN e MANAGER podem consultar alertas.
   - USER pode consultar apenas se o projeto já permite consulta de produtos para USER.
   - Caso contrário, restringir para ADMIN e MANAGER.

4. Implementar paginação:
   - page
   - limit

5. Implementar filtros opcionais:
   - name
   - sku

6. Retornar:
   - id
   - name
   - sku
   - quantity
   - minimumStock
   - active
   - createdAt
   - updatedAt

7. Ordenar por criticidade:
   - produtos com menor quantity primeiro
   - depois por name asc

8. Padronizar resposta conforme contrato atual da API.

9. Adicionar cache Redis:
   - products:low-stock:{hash}
   - TTL de 60 segundos
   - invalidar quando produto for criado, atualizado, deletado ou movimentado.

10. Atualizar Swagger/OpenAPI:

- documentar GET /products/low-stock
- query params page, limit, name, sku
- resposta paginada
- erros 400, 401, 403

11. Criar testes para:

- listar produtos com baixo estoque
- não listar produtos inativos
- não listar produtos deletados
- não listar produtos acima do estoque mínimo
- paginação
- filtro por name
- filtro por sku
- ordenação por criticidade
- RBAC
- cache e invalidação após movimentação

12. Executar:

- npm run lint
- npm run test
- npm run build

13. Não reescrever a arquitetura inteira. Seguir o padrão modular atual do projeto.
