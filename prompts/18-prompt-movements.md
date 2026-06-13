Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Prisma ORM, APIs REST, RBAC, Multi-Tenancy e regras de negócio de estoque.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Auth Module
- JWT Authentication
- RBAC
- Company Module
- Users Module
- Categories Module
- Suppliers Module
- Products Module
- Prisma ORM
- PostgreSQL
- Error Handler global
- Zod validation

Nesta tarefa, quero criar o módulo Inventory Movements para registrar entradas, saídas e ajustes de estoque.

Objetivo:

Criar o módulo responsável por movimentar o estoque dos produtos com segurança, transação no banco, validação de regras e histórico das operações.

Tarefas:

1. Atualizar o schema.prisma criando o model InventoryMovement.
2. Criar migration para InventoryMovement.
3. Criar enum InventoryMovementType.
4. Criar módulo inventory.
5. Criar InventoryController.
6. Criar InventoryService.
7. Criar inventory.routes.ts.
8. Criar DTOs com Zod.
9. Registrar rotas no roteador principal.
10. Proteger todas as rotas com authenticate.
11. Aplicar RBAC.
12. Aplicar multi-tenancy usando req.user.companyId.
13. Usar transaction do Prisma ao movimentar estoque.

Model InventoryMovement:

- id
- companyId
- productId
- userId
- type
- quantity
- previousQuantity
- newQuantity
- reason
- createdAt
- company
- product
- user

Enum InventoryMovementType:

- ENTRY
- EXIT
- ADJUSTMENT

Rotas:

POST /api/inventory/movements
GET /api/inventory/movements
GET /api/inventory/movements/:id

Regras de permissão:

POST:

- ADMIN
- MANAGER
- EMPLOYEE

GET:

- ADMIN
- MANAGER

GET BY ID:

- ADMIN
- MANAGER

Regras de negócio:

1. Movimentação pertence a uma empresa.
2. companyId deve vir do req.user.companyId.
3. userId deve vir do req.user.id.
4. productId deve pertencer à empresa logada.
5. Produto deletado não pode ser movimentado.
6. Produto inativo não pode ser movimentado.
7. quantity deve ser maior que zero.
8. ENTRY aumenta o estoque.
9. EXIT reduz o estoque.
10. EXIT não pode deixar estoque negativo.
11. ADJUSTMENT define uma nova quantidade final.
12. ADJUSTMENT não pode definir quantidade negativa.
13. Toda movimentação deve salvar previousQuantity e newQuantity.
14. Atualização do produto e criação da movimentação devem ocorrer na mesma transação.
15. EMPLOYEE pode registrar movimentação, mas não pode listar histórico.
16. Não permitir alterar ou deletar movimentações.

Payload POST:

{
"productId": "product-id",
"type": "ENTRY",
"quantity": 5,
"reason": "Initial stock entry"
}

Para ADJUSTMENT, quantity representa a nova quantidade final:

{
"productId": "product-id",
"type": "ADJUSTMENT",
"quantity": 20,
"reason": "Inventory correction after manual count"
}

Critérios de aceitação:

1. ENTRY aumenta a quantidade do produto.
2. EXIT reduz a quantidade do produto.
3. EXIT sem estoque suficiente retorna 400.
4. ADJUSTMENT redefine a quantidade do produto.
5. Produto de outra empresa não pode ser movimentado.
6. Produto inativo não pode ser movimentado.
7. Produto deletado não pode ser movimentado.
8. Toda movimentação registra usuário responsável.
9. Toda movimentação registra previousQuantity e newQuantity.
10. EMPLOYEE consegue criar movimentação.
11. EMPLOYEE não consegue listar movimentações.
12. pnpm db:migrate deve funcionar.
13. pnpm lint deve passar.
14. pnpm typecheck deve passar.

Ao finalizar:

- Mostre os arquivos criados ou alterados.
- Explique o model InventoryMovement.
- Explique a diferença entre ENTRY, EXIT e ADJUSTMENT.
- Explique por que usar transação.
- Explique como testar no Insomnia/Postman.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

feat(inventory): implement inventory movements
