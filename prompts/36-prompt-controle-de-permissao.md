Implemente a Tarefa 37 no projeto StockFlow-api: adicionar controle de permissões baseado em roles (RBAC).

Requisitos:

1. Atualizar o schema do Prisma para adicionar o campo role no model User.
   - Criar enum UserRole com os valores: ADMIN, MANAGER e USER.
   - O valor padrão deve ser USER.

2. Criar ou ajustar os tipos da aplicação para reconhecer req.user com:
   - id
   - email
   - role

3. Garantir que no login o JWT inclua também a role do usuário.

4. Atualizar o middleware de autenticação para adicionar a role dentro de req.user.

5. Criar um middleware de autorização chamado ensureRole ou authorizeRoles.
   - Ele deve receber uma lista de roles permitidas.
   - Se o usuário não estiver autenticado, retornar 401.
   - Se o usuário não tiver permissão, retornar 403.

6. Aplicar esse middleware nas rotas sensíveis de usuários:
   - GET /users deve permitir apenas ADMIN.
   - DELETE /users/:id deve permitir apenas ADMIN.
   - PATCH /users/:id ou PUT /users/:id deve permitir apenas ADMIN ou MANAGER, se essa rota existir.

7. Atualizar a documentação Swagger dessas rotas informando que precisam de Bearer Token e permissões específicas.

8. Rodar:
   - npx prisma generate
   - criar migration do Prisma
   - npm run lint
   - npm run build

9. Manter o padrão atual do projeto, sem reescrever arquitetura inteira.
