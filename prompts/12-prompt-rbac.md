Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, JWT, RBAC, segurança e APIs REST.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Auth Module
- Register
- Login
- JWT
- Middleware authenticate
- req.user tipado
- Prisma ORM
- PostgreSQL
- Error Handler global

Nesta tarefa, quero criar controle de acesso baseado em papéis, também conhecido como RBAC.

Objetivo:

Criar um middleware authorizeRoles para proteger rotas com base no papel do usuário autenticado.

Roles existentes:

- ADMIN
- MANAGER
- EMPLOYEE

Regras de permissão iniciais:

ADMIN:

- Pode acessar tudo.

MANAGER:

- Pode gerenciar estoque, produtos, categorias e fornecedores.
- Não pode gerenciar usuários administradores.

EMPLOYEE:

- Pode consultar dados.
- Pode registrar movimentações simples futuramente.
- Não pode criar, editar ou excluir configurações críticas.

Tarefas:

1. Criar middleware authorizeRoles.
2. O middleware deve receber uma lista de roles permitidas.
3. Verificar se req.user existe.
4. Retornar 401 se não houver usuário autenticado.
5. Retornar 403 se o usuário não tiver permissão.
6. Criar rota protegida de teste para ADMIN.
7. Criar rota protegida de teste para ADMIN e MANAGER.
8. Não criar módulo de usuários ainda.
9. Não criar módulo de produtos ainda.

Estrutura esperada:

src/
├── shared/
│ └── http/
│ └── middlewares/
│ └── authorize-roles.ts

Exemplos de uso:

router.get(
'/admin-only',
authenticate,
authorizeRoles('ADMIN'),
controller.handle,
)

router.get(
'/management',
authenticate,
authorizeRoles('ADMIN', 'MANAGER'),
controller.handle,
)

Critérios de aceitação:

1. Rota com authorizeRoles('ADMIN') deve permitir apenas ADMIN.
2. Rota com authorizeRoles('ADMIN', 'MANAGER') deve permitir ADMIN e MANAGER.
3. Usuário autenticado sem permissão deve receber 403.
4. Usuário não autenticado deve receber 401.
5. pnpm lint deve passar.
6. pnpm typecheck deve passar.
7. GET /api/health deve continuar funcionando.
8. GET /api/me deve continuar funcionando.

Regras importantes:

- Não usar any.
- Usar tipagem baseada no enum UserRole do Prisma.
- Manter mensagens de erro padronizadas com AppError.
- Não duplicar lógica de autenticação.
- authorizeRoles deve ser usado apenas depois do authenticate.

Ao finalizar:

- Mostre os arquivos criados ou alterados.
- Explique diferença entre autenticação e autorização.
- Explique por que 401 e 403 são diferentes.
- Explique como testar no Insomnia/Postman.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

feat(auth): add role-based access control
