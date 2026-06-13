Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Prisma ORM, APIs REST, RBAC, Multi-Tenancy, Clean Code e regras de negócio de estoque.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Auth Module
- JWT Authentication
- RBAC
- Company Module
- Users Module
- Categories Module
- Suppliers Module
- Prisma ORM
- PostgreSQL
- Error Handler global
- Zod validation

Nesta tarefa, quero criar o módulo Products para permitir que cada empresa gerencie seus próprios produtos.

Objetivo:

Criar CRUD completo de produtos com autenticação, autorização, validação, soft delete, vínculo com categoria, vínculo com fornecedor e isolamento por empresa.

Tarefas:

1. Atualizar o schema.prisma criando o model Product.
2. Criar migration para Product.
3. Criar módulo products.
4. Criar ProductsController.
5. Criar ProductsService.
6. Criar products.routes.ts.
7. Criar DTOs com Zod.
8. Registrar rotas no roteador principal.
9. Proteger todas as rotas com authenticate.
10. Aplicar RBAC.
11. Aplicar multi-tenancy usando req.user.companyId.
12. Validar se categoryId pertence à empresa logada.
13. Validar se supplierId pertence à empresa logada.

Model Product:

- id
- companyId
- categoryId
- supplierId
- name
- description
- sku
- barcode
- costPrice
- salePrice
- quantity
- minimumStock
- status
- createdAt
- updatedAt
- deletedAt
- company
- category
- supplier

Enum ProductStatus:

- ACTIVE
- INACTIVE

Rotas:

POST /api/products
GET /api/products
GET /api/products/:id
PATCH /api/products/:id
DELETE /api/products/:id

Regras de permissão:

POST:

- ADMIN
- MANAGER

GET:

- ADMIN
- MANAGER
- EMPLOYEE

GET BY ID:

- ADMIN
- MANAGER
- EMPLOYEE

PATCH:

- ADMIN
- MANAGER

DELETE:

- ADMIN

Regras de negócio:

1. Produto pertence a uma empresa.
2. companyId nunca deve vir do body.
3. companyId deve vir sempre do req.user.companyId.
4. Uma empresa não pode acessar produto de outra empresa.
5. sku deve ser único por empresa.
6. barcode deve ser único por empresa, se informado.
7. quantity nunca pode ser negativa.
8. minimumStock nunca pode ser negativo.
9. costPrice não pode ser negativo.
10. salePrice não pode ser negativo.
11. categoryId deve existir e pertencer à empresa logada.
12. supplierId deve existir e pertencer à empresa logada.
13. Não retornar produtos com deletedAt preenchido.
14. DELETE deve ser soft delete.
15. Ao deletar, definir deletedAt e status INACTIVE.
16. Não permitir atualizar produto deletado.
17. Não permitir criar produto com categoria deletada.
18. Não permitir criar produto com fornecedor deletado.

Critérios de aceitação:

1. POST /api/products cria produto para a empresa logada.
2. GET /api/products lista apenas produtos da empresa logada.
3. GET /api/products/:id não permite acessar produto de outra empresa.
4. PATCH atualiza apenas produto da empresa logada.
5. DELETE faz soft delete.
6. EMPLOYEE não pode criar, editar ou deletar.
7. MANAGER não pode deletar.
8. SKU duplicado na mesma empresa retorna 409.
9. Barcode duplicado na mesma empresa retorna 409.
10. Produto não aceita categoria de outra empresa.
11. Produto não aceita fornecedor de outra empresa.
12. pnpm db:migrate deve funcionar.
13. pnpm lint deve passar.
14. pnpm typecheck deve passar.

Ao finalizar:

- Mostre os arquivos criados ou alterados.
- Explique o model Product.
- Explique como o multi-tenancy foi aplicado.
- Explique as validações de categoryId e supplierId.
- Explique as regras de RBAC.
- Explique como testar no Insomnia/Postman.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

feat(products): implement product management module
