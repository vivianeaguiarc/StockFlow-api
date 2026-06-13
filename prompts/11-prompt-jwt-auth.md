Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, JWT, autenticação, autorização e segurança.

Estou construindo a StockFlow API.

O projeto já possui:

- Auth Module
- Register
- Login
- JWT
- Prisma ORM
- PostgreSQL
- Error Handler
- Health Module

Objetivo:

Criar middleware de autenticação JWT para proteger rotas privadas da aplicação.

Tarefas:

1. Criar middleware authenticate.
2. Validar Bearer Token.
3. Verificar assinatura JWT.
4. Extrair payload do token.
5. Carregar usuário autenticado.
6. Anexar usuário à Request.
7. Criar tipagem customizada para Express Request.
8. Criar rota privada de teste.
9. Não criar RBAC ainda.

Estrutura esperada:

src/
├── shared/
│ ├── http/
│ │ └── middlewares/
│ │ └── authenticate.ts
│ │
│ └── types/
│ └── express.d.ts

Payload JWT esperado:

{
userId: string
companyId: string
role: string
}

Criar rota:

GET /api/me

Resposta:

{
"id": "...",
"companyId": "...",
"email": "...",
"role": "ADMIN"
}

Regras:

- Token ausente retorna 401.
- Token inválido retorna 401.
- Usuário removido retorna 401.
- Usuário inativo retorna 401.
- Empresa inativa retorna 401.
- Nunca confiar apenas no JWT.
- Sempre validar usuário no banco.

Critérios:

1. GET /api/me protegido.
2. Token válido retorna usuário.
3. Token inválido retorna 401.
4. pnpm lint passa.
5. pnpm typecheck passa.

Commit esperado:

feat(auth): add jwt authentication middleware
