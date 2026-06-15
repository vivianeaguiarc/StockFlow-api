Você é um engenheiro backend sênior especialista em Node.js, TypeScript, Prisma ORM, PostgreSQL, SaaS multiempresa, segurança com JWT/RBAC, DX para recrutadores, documentação técnica e APIs REST profissionais.

Implemente a Tarefa 61 no projeto StockFlow-api: criar seeds e dados de demonstração para facilitar testes do projeto.

Contexto:
O projeto já possui autenticação, RBAC, usuários, empresas, produtos, movimentações de estoque, histórico, dashboard, alertas de estoque baixo, Swagger, Docker, CI/CD, Redis, deploy no Render e suporte multiempresa.

Objetivo:
Permitir que recrutadores, avaliadores e desenvolvedores testem a API rapidamente com dados prontos e usuários de exemplo.

Requisitos:

1. Criar ou revisar arquivo de seed do Prisma:
   - prisma/seed.ts
   - ou seguir o padrão atual do projeto.

2. Criar empresas de demonstração:
   - StockFlow Demo LTDA
   - Tech Supplies Demo

3. Criar usuários de demonstração:
   - admin@stockflow.dev com role ADMIN
   - manager@stockflow.dev com role MANAGER
   - user@stockflow.dev com role USER

4. Usar senha segura apenas para ambiente demo, documentada no README:
   - Demo@123456
   - Nunca usar essa senha como secret real.

5. Criar produtos de demonstração:
   - Notebook Dell Inspiron
   - Mouse Logitech
   - Teclado Mecânico
   - Monitor LG
   - Cabo HDMI
   - produtos com estoque normal
   - produtos com estoque baixo
   - produtos inativos

6. Criar movimentações de estoque:
   - entradas
   - saídas
   - ajustes
   - motivos realistas

7. Garantir que os dados respeitem companyId:
   - usuários, produtos e movimentações devem pertencer às empresas corretas.

8. O seed deve ser idempotente:
   - pode rodar várias vezes sem duplicar dados indevidamente.

9. Adicionar script no package.json:
   - "db:seed": "prisma db seed"

10. Configurar prisma.seed no package.json, se necessário.

11. Atualizar README com seção:

- Dados de demonstração
- Usuários demo
- Como rodar seed localmente
- Como testar no Swagger

12. Não executar seed automaticamente em produção sem intenção explícita.

13. Criar testes simples, se o projeto tiver padrão para seed:

- seed executa sem erro
- usuários demo existem
- produtos demo existem

14. Executar:

- npm run db:seed
- npm run lint
- npm run test
- npm run build

15. Não alterar regras de negócio.
