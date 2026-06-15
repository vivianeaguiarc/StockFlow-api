Você é um arquiteto de software sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Clean Architecture, SaaS, multi-tenancy, segurança com JWT/RBAC, isolamento de dados, auditoria, Redis, Swagger/OpenAPI e sistemas de gestão de estoque.

Implemente a Tarefa 60 no projeto StockFlow-api: adicionar suporte multiempresa para transformar o projeto em uma base SaaS.

Contexto:
O projeto já possui:

- autenticação JWT
- RBAC
- usuários
- produtos
- movimentações de estoque
- histórico
- alertas de estoque baixo
- dashboard
- audit logs
- Redis
- Swagger/OpenAPI
- respostas padronizadas

Objetivo:
Permitir que a API suporte múltiplas empresas, isolando usuários, produtos, movimentações e métricas por empresa.

Requisitos:

1. Criar model Company:
   - id String @id @default(uuid())
   - name String
   - document String? @unique
   - active Boolean @default(true)
   - createdAt DateTime @default(now())
   - updatedAt DateTime @updatedAt
   - deletedAt DateTime?

2. Relacionar Company com:
   - User
   - Product
   - StockMovement
   - AuditLog, se fizer sentido no padrão atual

3. Adicionar companyId nas entidades principais:
   - User
   - Product
   - StockMovement
   - AuditLog

4. Atualizar JWT para incluir:
   - userId
   - email
   - role
   - companyId

5. Garantir isolamento de dados:
   - usuário só acessa dados da própria empresa
   - produtos filtrados por companyId
   - movimentações filtradas por companyId
   - dashboard filtrado por companyId
   - low stock filtrado por companyId

6. Criar CRUD básico de empresas:
   - POST /api/v1/companies
   - GET /api/v1/companies
   - GET /api/v1/companies/:id
   - PATCH /api/v1/companies/:id
   - DELETE /api/v1/companies/:id

7. Aplicar RBAC:
   - ADMIN pode gerenciar empresas
   - MANAGER pode consultar a própria empresa
   - USER não gerencia empresas

8. Implementar soft delete em Company.

9. Atualizar criação de usuários:
   - todo usuário deve pertencer a uma empresa
   - validar se companyId existe e está ativa

10. Atualizar cache Redis:

- incluir companyId nas chaves
- exemplo: products:list:{companyId}:{hash}
- dashboard:stock:{companyId}

11. Atualizar audit logs:

- registrar companyId nas ações críticas.

12. Atualizar Swagger/OpenAPI:

- Company
- CreateCompanyRequest
- UpdateCompanyRequest
- PaginatedCompaniesResponse
- atualizar schemas que agora possuem companyId

13. Atualizar testes:

- usuário não acessa dados de outra empresa
- produto fica isolado por companyId
- movimentações ficam isoladas por companyId
- dashboard respeita companyId
- CRUD de empresas
- RBAC
- cache por empresa

14. Criar migration:
    npx prisma migrate dev --name add-multi-company-support

15. Executar:

- npx prisma generate
- npm run lint
- npm run test
- npm run build

16. Não reescrever a arquitetura inteira.
    Fazer adaptação incremental e segura.
