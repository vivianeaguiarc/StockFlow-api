Implemente a Tarefa 38 no projeto StockFlow-api: criar o endpoint GET /api/v1/auth/me para retornar os dados do usuário autenticado.

Requisitos:

1. Criar uma rota protegida:
   GET /api/v1/auth/me

2. Essa rota deve exigir Bearer Token JWT.

3. Usar o middleware de autenticação já existente para acessar req.user.

4. Buscar o usuário no banco pelo id presente no token.

5. Retornar apenas dados seguros do usuário, sem password/hash:
   - id
   - name
   - email
   - role
   - createdAt
   - updatedAt

6. Caso o usuário autenticado não exista mais no banco, retornar 404.

7. Caso o token esteja ausente ou inválido, manter o comportamento atual do middleware de autenticação.

8. Atualizar a documentação Swagger:
   - adicionar o endpoint GET /auth/me
   - informar security BearerAuth
   - documentar respostas 200, 401 e 404

9. Manter o padrão atual do projeto, sem reescrever a arquitetura inteira.

10. Rodar:

- npm run lint
- npm run build
