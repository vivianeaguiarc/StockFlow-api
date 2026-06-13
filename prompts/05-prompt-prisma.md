Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Prisma ORM, PostgreSQL, arquitetura backend e boas práticas de banco de dados.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Node.js
- TypeScript
- Express
- ESLint
- Prettier
- Husky
- lint-staged
- commitlint
- Docker Compose
- PostgreSQL
- .env.example com DATABASE_URL

Nesta tarefa, quero configurar o Prisma ORM para conectar a API ao PostgreSQL.

Objetivo:

Instalar e configurar Prisma ORM no projeto, criando a estrutura inicial de banco de dados para suportar uma API SaaS multiempresa.

Tarefas:

1. Instalar Prisma e Prisma Client.
2. Inicializar o Prisma no projeto.
3. Configurar o datasource PostgreSQL usando DATABASE_URL.
4. Criar o arquivo prisma/schema.prisma.
5. Criar o primeiro modelo Company.
6. Criar o primeiro modelo User.
7. Criar enum UserRole com ADMIN, MANAGER e EMPLOYEE.
8. Criar enum UserStatus com ACTIVE e INACTIVE.
9. Criar relacionamento entre Company e User.
10. Criar campos de auditoria básicos: createdAt e updatedAt.
11. Criar campo deletedAt opcional para soft delete.
12. Criar migration inicial.
13. Criar arquivo src/shared/database/prisma.ts para exportar uma instância única do PrismaClient.
14. Atualizar scripts do package.json para facilitar uso do Prisma.

Modelos esperados:

Company:

- id
- name
- document
- email
- phone
- status
- createdAt
- updatedAt
- deletedAt
- users

User:

- id
- companyId
- firstName
- lastName
- email
- passwordHash
- role
- status
- createdAt
- updatedAt
- deletedAt
- company

Enums:

CompanyStatus:

- ACTIVE
- INACTIVE

UserRole:

- ADMIN
- MANAGER
- EMPLOYEE

UserStatus:

- ACTIVE
- INACTIVE

Regras importantes:

1. Email de usuário deve ser único.
2. Documento da empresa deve ser único.
3. Email da empresa deve ser único.
4. Cada usuário pertence a uma empresa.
5. Uma empresa pode ter vários usuários.
6. Usar cuid() ou uuid() para IDs.
7. Não criar módulo de autenticação ainda.
8. Não criar controllers ainda.
9. Não criar rotas ainda.
10. Apenas configurar Prisma e os primeiros modelos.

Scripts desejados no package.json:

- db:generate
- db:migrate
- db:studio
- db:push

Critérios de aceitação:

1. pnpm prisma generate deve funcionar.
2. pnpm prisma migrate dev deve criar a migration inicial.
3. pnpm db:studio deve abrir o Prisma Studio.
4. A pasta prisma/migrations deve ser criada.
5. O arquivo src/shared/database/prisma.ts deve exportar o PrismaClient.
6. O projeto deve continuar passando em pnpm lint.
7. O projeto deve continuar passando em pnpm typecheck.

Ao finalizar:

- Mostre os comandos executados.
- Mostre os arquivos criados ou alterados.
- Explique cada model criado.
- Explique o relacionamento Company -> User.
- Explique como testar.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

chore: configure prisma orm
