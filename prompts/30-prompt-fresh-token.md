Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, JWT, refresh tokens, segurança de autenticação e Prisma ORM.

Estou construindo a StockFlow API.

O projeto já possui:

- Auth Register/Login
- JWT Access Token
- RBAC
- Multi-Tenancy
- Audit Logs
- Rate Limiting
- Redis Cache
- Testes
- Swagger
- Docker
- CI/CD

Objetivo:

Implementar refresh token, rotação de tokens e logout seguro.

Tarefas:

1. Criar model RefreshToken no Prisma.
2. Criar migration.
3. Atualizar login para retornar accessToken e refreshToken.
4. Criar rota POST /api/auth/refresh.
5. Criar rota POST /api/auth/logout.
6. Salvar refresh token como hash no banco.
7. Definir expiração do refresh token.
8. Invalidar refresh token no logout.
9. Implementar rotação: ao usar refresh, revogar token antigo e gerar novo.
10. Atualizar Swagger.
11. Atualizar testes E2E.

Model RefreshToken:

- id
- userId
- tokenHash
- expiresAt
- revokedAt
- createdAt
- user

Rotas:

POST /api/auth/refresh
POST /api/auth/logout

Payload refresh:

{
"refreshToken": "..."
}

Resposta refresh:

{
"accessToken": "...",
"refreshToken": "..."
}

Regras de segurança:

1. Nunca salvar refreshToken em texto puro.
2. Refresh token expirado deve retornar 401.
3. Refresh token revogado deve retornar 401.
4. Logout deve revogar o refresh token.
5. Rotação deve revogar o token antigo.
6. Não retornar passwordHash.
7. Não expor motivo detalhado em token inválido.
8. Registrar logout e refresh em Audit Logs, se já existir integração.

Critérios de aceitação:

1. Login retorna accessToken e refreshToken.
2. Refresh gera novo accessToken.
3. Refresh gera novo refreshToken.
4. Token antigo não funciona após rotação.
5. Logout revoga refreshToken.
6. pnpm lint passa.
7. pnpm typecheck passa.
8. pnpm test passa.

Commit esperado:

feat(auth): add refresh token and logout
