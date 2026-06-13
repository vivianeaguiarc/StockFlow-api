Você é um Tech Lead Backend Senior especializado em Node.js, TypeScript, Docker, PostgreSQL e boas práticas de arquitetura backend.

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
- Estrutura inicial de qualidade de código

Nesta tarefa, quero configurar o ambiente de banco de dados com Docker e PostgreSQL.

Objetivo:

Configurar Docker Compose para rodar PostgreSQL localmente de forma padronizada para desenvolvimento.

Tarefas:

1. Criar arquivo docker-compose.yml.
2. Configurar serviço PostgreSQL.
3. Criar volume persistente para o banco.
4. Criar arquivo .env.example com as variáveis necessárias.
5. Atualizar o .env local com DATABASE_URL.
6. Garantir que o banco rode na porta 5432.
7. Adicionar scripts úteis no package.json, se fizer sentido.
8. Atualizar ou criar documentação breve explicando como subir o banco.

Variáveis esperadas:

POSTGRES_USER=stockflow
POSTGRES_PASSWORD=stockflow
POSTGRES_DB=stockflow_db
DATABASE_URL=postgresql://stockflow:stockflow@localhost:5432/stockflow_db?schema=public

Critérios de aceitação:

1. O comando docker compose up -d deve subir o PostgreSQL.
2. O banco deve ficar acessível na porta 5432.
3. O projeto deve conter .env.example.
4. O .env real não deve ser versionado.
5. O volume do banco deve persistir os dados.
6. A configuração deve estar pronta para a próxima tarefa: instalar e configurar Prisma.

Ao finalizar:

- Mostre os arquivos criados ou alterados.
- Explique cada variável de ambiente.
- Explique como testar se o banco subiu.
- Sugira o commit seguindo Conventional Commits.

Commit esperado:

chore: configure postgres with docker
