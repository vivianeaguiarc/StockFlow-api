Você é um engenheiro backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, arquitetura modular, APIs REST e sistemas de gestão de estoque.

Implemente a Tarefa 55 no projeto StockFlow-api: módulo completo de produtos.

Objetivo:
Criar a entidade principal de negócio do StockFlow.

Requisitos:

1. Criar model Product:

- id
- name
- description
- sku (único)
- price
- quantity
- minimumStock
- active
- createdAt
- updatedAt

2. Criar CRUD completo:

- POST /api/v1/products
- GET /api/v1/products
- GET /api/v1/products/:id
- PATCH /api/v1/products/:id
- DELETE /api/v1/products/:id

3. Aplicar RBAC:

- ADMIN e MANAGER podem criar/editar
- USER apenas consulta

4. Aplicar paginação.

5. Aplicar filtros:

- name
- sku
- active

6. Validar:

- preço > 0
- quantidade >= 0

7. Implementar soft delete.

8. Registrar audit logs.

9. Adicionar cache Redis.

10. Documentar no Swagger.

11. Criar testes.

12. Executar:

- npm run lint
- npm run test
- npm run build
