Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Docker, Docker Compose, Prisma, PostgreSQL, segurança e deploy backend.

Estou construindo a StockFlow API.

O projeto já possui:

- Node.js + TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Docker Compose para banco local
- Testes automatizados
- Swagger
- CI/CD com GitHub Actions

Nesta tarefa, quero preparar a aplicação para rodar em container Docker.

Objetivo:

Criar Dockerfile e configuração Docker Compose para executar a API em ambiente semelhante ao de produção.

Tarefas:

1. Criar Dockerfile.
2. Criar .dockerignore.
3. Atualizar docker-compose.yml para incluir serviço da API.
4. Manter PostgreSQL no compose.
5. Garantir que a API dependa do banco.
6. Rodar Prisma generate no build.
7. Rodar build TypeScript.
8. Executar aplicação com node dist/server.js.
9. Expor porta 3333.
10. Não copiar node_modules local.
11. Não copiar .env para dentro da imagem.
12. Garantir compatibilidade com pnpm.

Critérios de aceitação:

1. docker compose up --build deve subir API e banco.
2. GET /api/health deve funcionar dentro do container.
3. A imagem não deve incluir node_modules local.
4. A imagem não deve incluir arquivos desnecessários.
5. pnpm lint deve passar.
6. pnpm typecheck deve passar.

Commit esperado:

chore: dockerize api application
