Você é um arquiteto de software e engenheiro backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Clean Architecture, SOLID, DDD tático, testes automatizados com Vitest e APIs REST profissionais.

Implemente a Tarefa 50 no projeto StockFlow-api: refatorar gradualmente a estrutura da aplicação para uma arquitetura mais limpa, modular e sustentável.

Contexto:
O projeto já possui:

- Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT + RBAC
- Refresh Token + Logout
- Audit Logs
- Soft Delete
- Paginação e filtros
- Docker
- GitHub Actions
- Observabilidade
- Redis Cache
- Swagger/OpenAPI profissional
- Testes automatizados

Objetivo:
Melhorar a organização do código sem quebrar funcionalidades existentes.

Requisitos:

1. Não reescrever o projeto inteiro.
   Fazer refatoração incremental e segura.

2. Organizar o código por módulos/domínios, por exemplo:

src/
modules/
auth/
controllers/
services/
dtos/
routes/
users/
controllers/
services/
repositories/
dtos/
routes/
audit/
services/
repositories/
health/
controllers/
routes/
shared/
middlewares/
errors/
logger/
cache/
database/
utils/
types/

3. Separar responsabilidades:
   - Controller: recebe request e response.
   - Service/Use Case: regra de negócio.
   - Repository: acesso ao banco.
   - DTO/Validator: entrada e saída de dados.
   - Middleware: autenticação, autorização, requestId, errors.

4. Criar interfaces para repositories principais:
   - UsersRepository
   - RefreshTokensRepository
   - AuditLogsRepository

5. Manter Prisma isolado dentro da camada de infraestrutura/repository.

6. Evitar uso direto do Prisma dentro dos controllers.

7. Garantir que regras de negócio fiquem em services/use cases.

8. Manter todas as rotas públicas e contratos atuais funcionando.

9. Corrigir imports e aliases, se necessário.

10. Ajustar testes existentes para a nova estrutura.

11. Criar testes unitários para services/use cases quando fizer sentido.

12. Atualizar README com uma seção simples explicando a arquitetura.

13. Executar:

- npm run lint
- npm run test
- npm run build

14. Garantir que Swagger continue funcionando.

15. Garantir que Docker e CI não quebrem.
