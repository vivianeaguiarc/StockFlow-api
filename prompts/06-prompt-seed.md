Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Prisma ORM, PostgreSQL, segurança e boas práticas backend.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Node.js
- TypeScript
- Express
- PostgreSQL com Docker
- Prisma ORM configurado
- Models Company e User
- Enums CompanyStatus, UserRole e UserStatus
- PrismaClient centralizado em src/shared/database/prisma.ts
- ESLint, Prettier, Husky, lint-staged e commitlint

Nesta tarefa, quero criar um seed inicial para popular o banco com uma empresa e um usuário administrador.

Objetivo:

Criar um script de seed usando Prisma para inserir dados iniciais de desenvolvimento.

Tarefas:

1. Criar arquivo prisma/seed.ts.
2. Instalar bcryptjs e seus tipos, se necessário.
3. Criar hash da senha antes de salvar no banco.
4. Criar uma empresa inicial.
5. Criar um usuário ADMIN vinculado à empresa.
6. Evitar duplicidade usando upsert.
7. Configurar script de seed no package.json.
8. Garantir compatibilidade com pnpm e TypeScript.
9. Explicar como executar o seed.
10. Não criar rotas, controllers ou autenticação ainda.

Dados sugeridos:

Company:

- name: StockFlow Demo Company
- document: 00000000000100
- email: admin@stockflow.com
- phone: +5532999999999

User:

- firstName: Admin
- lastName: StockFlow
- email: admin@stockflow.com
- password: Admin@123456
- role: ADMIN
- status: ACTIVE

Regras importantes:

- Nunca salvar senha em texto puro.
- Usar passwordHash no banco.
- Usar upsert para não duplicar dados ao rodar o seed mais de uma vez.
- Conectar e desconectar Prisma corretamente.
- Tratar erros no script de seed.
- Não versionar dados sensíveis reais.

Critérios de aceitação:

1. pnpm db:seed deve executar com sucesso.
2. A empresa inicial deve ser criada.
3. O usuário ADMIN deve ser criado.
4. A senha deve ser salva como hash.
5. Rodar o seed mais de uma vez não deve duplicar empresa nem usuário.
6. pnpm lint deve passar.
7. pnpm typecheck deve passar.

Ao finalizar:

- Mostre os comandos executados.
- Mostre os arquivos criados ou alterados.
- Explique o uso do upsert.
- Explique por que usamos hash de senha.
- Explique como validar no Prisma Studio.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

chore: add database seed
