Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Segurança de APIs, OWASP Top 10 e Rate Limiting.

Estou construindo a StockFlow API.

O projeto já possui:

- JWT Authentication
- RBAC
- Multi-Tenancy
- Audit Logs
- Dashboard
- Swagger
- Testes
- CI/CD
- Docker
- Observabilidade

Objetivo:

Adicionar proteção contra abuso da API usando rate limiting.

Tarefas:

1. Instalar express-rate-limit.
2. Criar configuração centralizada de rate limits.
3. Criar rate limit global.
4. Criar rate limit específico para login.
5. Criar rate limit específico para register.
6. Integrar ao Express.
7. Não bloquear Swagger.
8. Adicionar logs quando limite for atingido.
9. Atualizar documentação.

Estrutura esperada:

src/
├── shared/
│ ├── security/
│ │ └── rate-limit.ts

Configurações:

Global:

- 100 requests
- janela de 15 minutos

Login:

- 5 tentativas
- janela de 15 minutos

Register:

- 10 tentativas
- janela de 1 hora

Resposta esperada:

{
"status": "error",
"message": "Too many requests"
}

Regras:

1. Login deve ser protegido.
2. Register deve ser protegido.
3. Swagger deve permanecer acessível.
4. Limites devem ser configuráveis por variável de ambiente.
5. Não expor detalhes internos.

Critérios:

1. Rate limiting funcionando.
2. Login protegido.
3. Register protegido.
4. Logs funcionando.
5. pnpm lint passa.
6. pnpm typecheck passa.
7. pnpm test passa.

Commit esperado:

feat(security): add rate limiting
