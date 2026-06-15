Você é um engenheiro backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Clean Architecture, APIs REST, segurança com JWT/RBAC, Redis, Swagger/OpenAPI, testes automatizados e sistemas de gestão de estoque.

Implemente a Tarefa 55 no projeto StockFlow-api: criar o módulo completo de produtos.

Contexto:
O projeto já possui autenticação, RBAC, refresh token, soft delete, paginação, filtros, audit logs, Redis, Swagger, CI/CD, Docker, observabilidade, segurança avançada, deploy no Render e padronização de respostas.

Objetivo:
Criar o primeiro módulo central de negócio do StockFlow: gestão de produtos.

Requisitos:

1. Criar model Product no Prisma:
   - id String @id @default(uuid())
   - name String
   - description String?
   - sku String @unique
   - price Decimal
   - quantity Int @default(0)
   - minimumStock Int @default(0)
   - active Boolean @default(true)
   - deletedAt DateTime?
   - createdAt DateTime @default(now())
   - updatedAt DateTime @updatedAt

2. Criar migration:
   npx prisma migrate dev --name add-products

3. Criar rotas:
   - POST /api/v1/products
   - GET /api/v1/products
   - GET /api/v1/products/:id
   - PATCH /api/v1/products/:id
   - DELETE /api/v1/products/:id

4. Aplicar RBAC:
   - ADMIN e MANAGER podem criar, atualizar e deletar produtos.
   - ADMIN, MANAGER e USER podem consultar produtos.

5. Implementar paginação em GET /products:
   - page
   - limit

6. Implementar filtros:
   - name
   - sku
   - active

7. Validar regras:
   - name obrigatório
   - sku obrigatório e único
   - price > 0
   - quantity >= 0
   - minimumStock >= 0

8. Implementar soft delete:
   - DELETE deve preencher deletedAt
   - listagem deve retornar apenas deletedAt null

9. Registrar audit logs:
   - CREATE_PRODUCT
   - UPDATE_PRODUCT
   - DELETE_PRODUCT

10. Implementar cache Redis:

- products:list:{hash}
- products:id:{id}
- invalidar cache ao criar, atualizar ou deletar

11. Padronizar respostas conforme contrato atual da API.

12. Atualizar Swagger/OpenAPI:

- Product
- CreateProductRequest
- UpdateProductRequest
- PaginatedProductsResponse
- erros 400, 401, 403, 404, 409

13. Criar testes para:

- criar produto
- impedir SKU duplicado
- listar produtos com paginação
- filtrar por name, sku e active
- buscar produto por id
- atualizar produto
- soft delete
- RBAC em rotas protegidas
- audit logs
- cache invalidation

14. Executar:

- npx prisma generate
- npm run lint
- npm run test
- npm run build

15. Não reescrever a arquitetura inteira. Seguir o padrão modular atual do projeto.
