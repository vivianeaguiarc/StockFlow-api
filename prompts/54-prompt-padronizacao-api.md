Você é um engenheiro backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, APIs REST, padronização de contratos, Clean Architecture, segurança e experiência de integração com frontend.

Implemente a Tarefa 54 no projeto StockFlow-api: padronizar as respostas de sucesso e erro da API.

Contexto:
O projeto já possui autenticação, RBAC, refresh token, soft delete, paginação, filtros, audit logs, Redis, Swagger, CI/CD, Docker, observabilidade, segurança avançada e deploy no Render.

Objetivo:
Garantir que todas as respostas da API sigam um contrato consistente, previsível e fácil de consumir pelo frontend.

Requisitos:

1. Criar padrão de resposta de sucesso:

{
"success": true,
"message": "Operation completed successfully",
"data": {}
}

2. Criar padrão para respostas paginadas:

{
"success": true,
"message": "Users retrieved successfully",
"data": [],
"pagination": {
"page": 1,
"limit": 10,
"totalItems": 100,
"totalPages": 10,
"hasNextPage": true,
"hasPreviousPage": false
}
}

3. Criar padrão de erro:

{
"success": false,
"message": "Validation error",
"error": {
"code": "VALIDATION_ERROR",
"details": []
},
"requestId": "uuid"
}

4. Garantir que erros 400, 401, 403, 404, 409, 429 e 500 usem o mesmo formato.

5. Garantir que nenhuma resposta exponha:
   - password
   - passwordHash
   - accessToken em logs
   - refreshToken em logs
   - stack trace em produção

6. Criar helpers ou presenters:
   - successResponse
   - paginatedResponse
   - errorResponse

7. Atualizar controllers para usar o novo padrão.

8. Atualizar middleware global de erro.

9. Atualizar Swagger/OpenAPI com os novos schemas:
   - SuccessResponse
   - ErrorResponse
   - PaginatedResponse
   - PaginationMeta

10. Atualizar testes existentes para validar o novo contrato.

11. Atualizar README com seção:

- Padrão de respostas da API

12. Executar:

- npm run lint
- npm run test
- npm run build

13. Não alterar regras de negócio.
