Implemente a Tarefa 39 no projeto StockFlow-api: adicionar Soft Delete para usuários.

Requisitos:

1. Atualizar o schema do Prisma:
   - Adicionar o campo deletedAt DateTime? no model User.

2. Criar uma migration:
   - npx prisma migrate dev --name add-user-soft-delete

3. Alterar a exclusão de usuários:
   - Não usar mais delete físico no banco.
   - Ao deletar, atualizar o campo deletedAt com new Date().

4. Ajustar as consultas de usuários:
   - Listagem deve retornar apenas usuários com deletedAt: null.
   - Busca por id deve retornar apenas usuários com deletedAt: null.
   - Busca por email, se existir, deve ignorar usuários deletados.

5. Ajustar regras de atualização:
   - Não permitir atualizar usuário com deletedAt diferente de null.

6. Ajustar retorno das rotas:
   - DELETE /users/:id pode retornar 204 No Content ou mensagem de sucesso, conforme padrão atual do projeto.
   - Se o usuário não existir ou já estiver deletado, retornar 404.

7. Atualizar Swagger:
   - Informar que DELETE /users/:id realiza soft delete.
   - Documentar respostas 204/200, 401, 403 e 404.

8. Rodar:
   - npx prisma generate
   - npm run lint
   - npm run build

Importante:

- Manter o padrão atual do projeto.
- Não reescrever a arquitetura inteira.
