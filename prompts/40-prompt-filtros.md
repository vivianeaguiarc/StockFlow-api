Implemente a Tarefa 41 no projeto StockFlow-api: adicionar filtros e busca na listagem de usuários.

Requisitos:

1. Atualizar o endpoint:
   GET /api/v1/users

2. Manter a paginação já criada:
   - page
   - limit

3. Adicionar query params opcionais:
   - name
   - email
   - role

Exemplos:
GET /api/v1/users?name=vivi
GET /api/v1/users?email=gmail
GET /api/v1/users?role=ADMIN
GET /api/v1/users?page=1&limit=10&role=MANAGER

4. Aplicar filtros usando Prisma:
   - name com contains
   - email com contains
   - role com igualdade exata

5. A busca por name e email deve ser case-insensitive, se o banco/Prisma permitir.

6. Continuar retornando apenas usuários ativos:
   - deletedAt: null

7. Manter o controle RBAC já existente:
   - apenas ADMIN deve listar usuários, conforme tarefa anterior.

8. Atualizar os metadados de paginação para considerar os filtros aplicados:
   - totalItems
   - totalPages
   - hasNextPage
   - hasPreviousPage

9. Validar role:
   - aceitar apenas ADMIN, MANAGER ou USER.
   - se a role for inválida, retornar 400.

10. Atualizar Swagger:

- documentar filtros name, email e role
- adicionar exemplos de uso com paginação + filtros

11. Criar ou ajustar testes para:

- filtro por name
- filtro por email
- filtro por role
- filtro combinado com paginação
- role inválida

12. Executar:

- npm run lint
- npm run build
