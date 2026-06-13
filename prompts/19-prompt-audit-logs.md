Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, segurança, auditoria, LGPD, rastreabilidade e APIs REST.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Auth Module
- JWT Authentication
- RBAC
- Company Module
- Users Module
- Categories Module
- Suppliers Module
- Products Module
- Inventory Movements
- Prisma ORM
- PostgreSQL
- Error Handler global
- Zod validation
- Multi-Tenancy aplicado nos módulos

Nesta tarefa, quero criar o módulo Audit Logs para registrar ações críticas da aplicação.

Objetivo:

Criar uma estrutura de auditoria para registrar ações importantes realizadas pelos usuários, mantendo rastreabilidade por empresa, usuário, entidade e ação executada.

Tarefas:

1. Atualizar schema.prisma criando o model AuditLog.
2. Criar migration para AuditLog.
3. Criar enum AuditAction.
4. Criar módulo audit.
5. Criar AuditController.
6. Criar AuditService.
7. Criar audit.routes.ts.
8. Criar helper ou service para registrar logs de auditoria.
9. Registrar rotas no roteador principal.
10. Proteger todas as rotas com authenticate.
11. Aplicar RBAC.
12. Aplicar multi-tenancy usando req.user.companyId.

Model AuditLog:

- id
- companyId
- userId
- action
- entity
- entityId
- oldValue
- newValue
- ipAddress
- userAgent
- createdAt
- company
- user

Enum AuditAction:

- CREATE
- UPDATE
- DELETE
- LOGIN
- LOGOUT
- STOCK_ENTRY
- STOCK_EXIT
- STOCK_ADJUSTMENT

Rotas:

GET /api/audit/logs
GET /api/audit/logs/:id

Regras de permissão:

GET:

- ADMIN

GET BY ID:

- ADMIN

Regras de negócio:

1. AuditLog pertence a uma empresa.
2. companyId deve vir do usuário autenticado.
3. userId deve vir do usuário autenticado.
4. Apenas ADMIN pode consultar auditorias.
5. Empresa não pode acessar auditoria de outra empresa.
6. Não permitir criar, editar ou deletar audit logs via rota pública.
7. Logs devem ser criados internamente pelos services.
8. oldValue e newValue devem ser JSON opcionais.
9. Registrar IP e User-Agent quando possível.
10. Não registrar senha, token ou dados sensíveis.
11. Não retornar logs de empresa diferente.
12. Audit logs não devem ter soft delete.

Integrar auditoria inicialmente em:

- Login bem-sucedido
- Criação de usuário
- Atualização de usuário
- Soft delete de usuário
- Criação de categoria
- Atualização de categoria
- Soft delete de categoria
- Criação de fornecedor
- Atualização de fornecedor
- Soft delete de fornecedor
- Criação de produto
- Atualização de produto
- Soft delete de produto
- Movimentações de estoque

Critérios de aceitação:

1. AuditLog deve ser criado no banco.
2. GET /api/audit/logs lista apenas logs da empresa logada.
3. GET /api/audit/logs/:id não permite acessar log de outra empresa.
4. Apenas ADMIN pode consultar logs.
5. MANAGER e EMPLOYEE recebem 403.
6. Logs são criados internamente nos services.
7. Logs nunca armazenam passwordHash, password, accessToken ou refreshToken.
8. pnpm db:migrate deve funcionar.
9. pnpm lint deve passar.
10. pnpm typecheck deve passar.

Ao finalizar:

- Mostre os arquivos criados ou alterados.
- Explique o model AuditLog.
- Explique como a auditoria ajuda em segurança e LGPD.
- Explique onde os logs foram integrados.
- Explique como testar no Insomnia/Postman.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

feat(audit): implement audit logs
