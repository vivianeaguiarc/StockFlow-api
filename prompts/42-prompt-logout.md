Implemente a Tarefa 43 no projeto StockFlow-api: adicionar Refresh Token e Logout.

Requisitos:

1. Atualizar o schema do Prisma criando o model RefreshToken:

model RefreshToken {
id String @id @default(uuid())
tokenHash String
userId String
expiresAt DateTime
revokedAt DateTime?
createdAt DateTime @default(now())

user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

2. Se necessário, adicionar no model User:

refreshTokens RefreshToken[]

3. Criar migration:

npx prisma migrate dev --name add-refresh-tokens

4. No login, retornar:
   - accessToken
   - refreshToken

5. O accessToken deve continuar com expiração curta.

6. O refreshToken deve ter expiração maior, por exemplo:
   - 7 dias
   - ou o padrão já definido no projeto.

7. Salvar no banco apenas o hash do refreshToken, nunca o token puro.

8. Criar endpoint:

POST /api/v1/auth/refresh

Body:
{
"refreshToken": "token"
}

Esse endpoint deve:

- validar se o token existe
- comparar com o hash salvo
- verificar se não está expirado
- verificar se não foi revogado
- gerar novo accessToken
- opcionalmente rotacionar o refreshToken

9. Criar endpoint:

POST /api/v1/auth/logout

Body:
{
"refreshToken": "token"
}

Esse endpoint deve:

- revogar o refreshToken preenchendo revokedAt
- retornar sucesso mesmo se o token já estiver inválido, sem vazar detalhes.

10. Registrar logs de auditoria:

- REFRESH_TOKEN
- LOGOUT

11. Atualizar Swagger:

- documentar login retornando accessToken e refreshToken
- documentar POST /auth/refresh
- documentar POST /auth/logout

12. Criar testes para:

- login retorna refreshToken
- refresh gera novo accessToken
- refreshToken expirado retorna 401
- refreshToken revogado retorna 401
- logout revoga refreshToken

13. Executar:

- npx prisma generate
- npm run lint
- npm run build
