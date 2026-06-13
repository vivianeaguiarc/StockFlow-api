Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Observabilidade, Logging, APIs REST e boas práticas de produção.

Estou construindo a StockFlow API.

O projeto já possui:

- JWT
- RBAC
- Multi-Tenancy
- Audit Logs
- Swagger
- Testes
- Docker
- CI/CD

Objetivo:

Adicionar logs estruturados à aplicação para facilitar monitoramento e troubleshooting.

Tarefas:

1. Instalar Pino.
2. Criar logger centralizado.
3. Criar middleware de request logging.
4. Registrar:
   - método HTTP
   - rota
   - status code
   - tempo de execução
5. Registrar erros inesperados.
6. Não logar:
   - senhas
   - tokens
   - passwordHash
7. Integrar ao error handler.
8. Criar utilitário de logger reutilizável.

Estrutura esperada:

src/
├── shared/
│ ├── logger/
│ │ ├── logger.ts
│ │ └── http-logger.ts

Critérios:

1. Todas as requisições devem gerar logs.
2. Erros devem gerar logs.
3. Dados sensíveis não devem aparecer.
4. pnpm lint deve passar.
5. pnpm typecheck deve passar.

Commit esperado:

feat(observability): add structured logging
