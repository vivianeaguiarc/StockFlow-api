Você é um engenheiro de software sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, Docker, Docker Compose, DevOps, CI/CD e arquitetura de APIs REST para ambientes de produção.

Implemente a Tarefa 45 no projeto StockFlow-api: dockerização completa da aplicação.

Contexto:
O projeto já possui:

- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT
- RBAC
- Soft Delete
- Paginação
- Filtros
- Audit Logs
- Refresh Token
- Testes Automatizados

Objetivo:
Permitir que qualquer desenvolvedor execute a aplicação utilizando apenas Docker.

Requisitos:

1. Criar Dockerfile otimizado para produção.

2. Utilizar build em múltiplos estágios (multi-stage build).

3. Gerar Prisma Client durante o build.

4. Criar docker-compose.yml contendo:
   - api
   - postgres

5. Configurar variáveis de ambiente adequadamente.

6. Garantir persistência de dados através de volume Docker.

7. Configurar healthcheck para PostgreSQL.

8. Garantir que a API só inicie após o banco estar disponível.

9. Criar arquivo:
   docker-compose.dev.yml

com suporte para:

- hot reload
- volume local

10. Adicionar scripts:

docker:up
docker:down
docker:logs

11. Atualizar README:

Adicionar seção:

# Executando com Docker

docker compose up -d

12. Validar:

- build da API
- conexão Prisma
- migrations
- Swagger
- login
- refresh token

13. Garantir compatibilidade com Linux, Windows e macOS.

14. Não remover suporte de execução local sem Docker.

15. Executar:

docker compose build

docker compose up -d

npm run lint

npm run build
