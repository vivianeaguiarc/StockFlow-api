Implemente a Tarefa 40 no projeto StockFlow-api: adicionar paginação na listagem de usuários.

Requisitos:

1. Atualizar o endpoint:
   GET /api/v1/users

2. Aceitar query params:
   - page
   - limit

Exemplo:

GET /users?page=1&limit=10

3. Definir valores padrão:
   - page = 1
   - limit = 10

4. Limitar o máximo de registros por página:
   - limit máximo = 100

5. Utilizar paginação nativa do Prisma:
   - skip
   - take

6. Retornar metadados de paginação:

{
"data": [],
"pagination": {
"page": 1,
"limit": 10,
"totalItems": 50,
"totalPages": 5,
"hasNextPage": true,
"hasPreviousPage": false
}
}

7. Garantir que apenas usuários não deletados (deletedAt = null) sejam retornados.

8. Manter a proteção RBAC existente.

9. Atualizar Swagger:
   - documentar page e limit
   - adicionar exemplo de resposta

10. Criar testes para:

- paginação padrão
- paginação customizada
- limite máximo
- página inexistente

11. Executar:

- npm run lint
- npm run build
