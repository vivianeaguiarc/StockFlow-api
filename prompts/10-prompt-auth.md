Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, JWT, autenticação, segurança e APIs REST.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Node.js
- TypeScript
- Express
- PostgreSQL com Docker
- Prisma ORM
- Models Company e User
- Seed inicial
- Camada HTTP organizada
- Error Handler global
- Módulo Health
- ESLint, Prettier, Husky, lint-staged e commitlint

Nesta tarefa, quero criar o módulo Auth com cadastro de empresa, criação do usuário ADMIN e login JWT.

Objetivo:

Permitir que uma nova empresa se cadastre no sistema e que o usuário administrador faça login recebendo um accessToken.

Tarefas:

1. Criar módulo auth.
2. Criar AuthController.
3. Criar AuthService.
4. Criar auth.routes.ts.
5. Criar DTOs para register e login.
6. Validar entrada de dados com Zod.
7. Criar middleware genérico validateRequest.
8. Criar rota POST /api/auth/register.
9. Criar rota POST /api/auth/login.
10. Cadastrar Company e User ADMIN em transação.
11. Fazer hash da senha com bcryptjs.
12. Validar senha no login.
13. Gerar accessToken com jsonwebtoken.
14. Configurar JWT_SECRET no .env e .env.example.
15. Não criar refresh token ainda.
16. Não criar recuperação de senha ainda.
17. Não criar RBAC ainda.

Estrutura esperada:

src/
├── modules/
│ └── auth/
│ ├── controllers/
│ │ └── AuthController.ts
│ ├── dtos/
│ │ ├── login.dto.ts
│ │ └── register-company.dto.ts
│ ├── routes/
│ │ └── auth.routes.ts
│ └── services/
│ └── AuthService.ts
│
├── shared/
│ └── http/
│ └── middlewares/
│ └── validate-request.ts

Dependências necessárias:

- bcryptjs
- jsonwebtoken
- zod

Dependências de desenvolvimento, se necessário:

- @types/jsonwebtoken

Payload esperado para register:

{
"company": {
"name": "StockFlow Company",
"document": "12345678000199",
"email": "company@example.com",
"phone": "+5532999999999"
},
"admin": {
"firstName": "Viviane",
"lastName": "Aguiar",
"email": "admin@example.com",
"password": "StrongPass@123"
}
}

Resposta esperada para register:

{
"company": {
"id": "...",
"name": "StockFlow Company",
"email": "company@example.com"
},
"admin": {
"id": "...",
"firstName": "Viviane",
"lastName": "Aguiar",
"email": "admin@example.com",
"role": "ADMIN"
}
}

Payload esperado para login:

{
"email": "admin@example.com",
"password": "StrongPass@123"
}

Resposta esperada para login:

{
"accessToken": "...",
"user": {
"id": "...",
"companyId": "...",
"firstName": "Viviane",
"lastName": "Aguiar",
"email": "admin@example.com",
"role": "ADMIN"
}
}

Regras de negócio:

1. Não permitir empresa com document duplicado.
2. Não permitir empresa com email duplicado.
3. Não permitir usuário com email duplicado.
4. Todo cadastro de empresa deve criar um usuário ADMIN.
5. Company e User devem ser criados na mesma transação.
6. Se a criação do usuário falhar, a empresa não deve ser criada.
7. Senha nunca deve ser salva em texto puro.
8. Login deve falhar com mensagem genérica para email ou senha inválidos.
9. Usuário INACTIVE não pode fazer login.
10. Empresa INACTIVE não permite login.
11. deletedAt diferente de null deve impedir login.
12. O token JWT deve conter userId, companyId e role.

Regras de segurança:

1. Não retornar passwordHash em nenhuma resposta.
2. Não expor se o email existe ou não no login.
3. Usar senha mínima de 8 caracteres.
4. JWT_SECRET deve vir do ambiente.
5. Se JWT_SECRET não estiver configurado, lançar erro interno controlado.
6. Não logar senha.
7. Não usar any.
8. Não duplicar lógica entre controller e service.

Critérios de aceitação:

1. POST /api/auth/register deve cadastrar empresa e usuário ADMIN.
2. POST /api/auth/login deve retornar accessToken válido.
3. Senha deve ser salva como hash.
4. Empresas duplicadas devem retornar erro 409.
5. Usuários duplicados devem retornar erro 409.
6. Login inválido deve retornar erro 401.
7. Usuário inativo deve retornar erro 401.
8. Empresa inativa deve retornar erro 401.
9. pnpm lint deve passar.
10. pnpm typecheck deve passar.
11. A API deve continuar respondendo GET /api/health.

Ao finalizar:

- Mostre os comandos executados.
- Mostre os arquivos criados ou alterados.
- Explique o fluxo de register.
- Explique o fluxo de login.
- Explique como testar no Insomnia/Postman.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

feat(auth): add company registration and login
