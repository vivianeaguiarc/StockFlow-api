Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, PostgreSQL, Docker, segurança, backup, disaster recovery e operação de sistemas backend.

Estou construindo a StockFlow API, uma API SaaS multiempresa de gestão de estoque.

O projeto já possui:

- Node.js + TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Redis
- Docker
- JWT + Refresh Token
- RBAC
- Multi-Tenancy
- Audit Logs
- Swagger
- Testes E2E
- CI/CD
- Health Check avançado
- API Versioning com /api/v1

Nesta tarefa, quero adicionar scripts de backup e restore do banco PostgreSQL.

Objetivo:

Criar scripts documentados para gerar backup e restaurar o banco em ambiente local/desenvolvimento, demonstrando preocupação com recuperação de dados.

Tarefas:

1. Criar pasta scripts.
2. Criar scripts/backup-db.sh.
3. Criar scripts/restore-db.sh.
4. Criar pasta backups com .gitkeep.
5. Garantir que arquivos .sql e .dump não sejam versionados.
6. Atualizar .gitignore.
7. Atualizar README com instruções.
8. Adicionar scripts no package.json, se fizer sentido.
9. Usar variáveis do .env.
10. Não expor senha no repositório.

Comandos esperados:

pnpm db:backup
pnpm db:restore

Critérios de aceitação:

1. Backup deve gerar arquivo dentro de backups/.
2. Restore deve aceitar um arquivo de backup como argumento.
3. Backups reais não devem ser versionados.
4. README deve explicar como usar.
5. pnpm lint passa.
6. pnpm typecheck passa.

Commit esperado:

chore(db): add backup and restore scripts
