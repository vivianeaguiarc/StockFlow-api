Você é um engenheiro backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, observabilidade, logs estruturados, monitoramento, segurança de APIs REST, Docker e boas práticas de produção.

Implemente a Tarefa 47 no projeto StockFlow-api: adicionar observabilidade básica profissional.

Contexto:
O projeto já possui:

- Express + TypeScript
- Prisma ORM + PostgreSQL
- Docker
- GitHub Actions CI
- JWT
- RBAC
- Refresh Token
- Audit Logs
- Swagger
- Testes automatizados
- Paginação e filtros
- Soft Delete

Objetivo:
Melhorar a capacidade de monitorar, depurar e validar a saúde da API em ambiente real.

Requisitos:

1. Criar middleware de Request ID:
   - Gerar um UUID para cada request.
   - Aceitar header x-request-id se já vier de proxy/gateway.
   - Adicionar o requestId no req.
   - Retornar o x-request-id no response header.

2. Criar ou ajustar logger estruturado:
   - Preferencialmente usando pino ou winston.
   - Logar em JSON em produção.
   - Logar de forma legível em desenvolvimento.
   - Nunca logar password, refreshToken, accessToken ou secrets.

3. Criar middleware de request logging:
   - method
   - path
   - statusCode
   - durationMs
   - requestId
   - ip
   - userAgent

4. Criar endpoint:

GET /api/v1/health

Resposta:
{
"status": "ok",
"timestamp": "2026-06-15T00:00:00.000Z",
"uptime": 123,
"environment": "development"
}

5. Criar endpoint:

GET /api/v1/ready

Esse endpoint deve validar:

- conexão com PostgreSQL usando Prisma
- resposta 200 se estiver pronto
- resposta 503 se o banco não estiver disponível

6. Atualizar Dockerfile/docker-compose, se necessário:
   - usar /api/v1/health como healthcheck da API

7. Atualizar Swagger:
   - documentar /health
   - documentar /ready

8. Criar testes para:
   - health retorna 200
   - ready retorna 200 quando banco está disponível
   - requestId é retornado no header
   - requestId recebido no header é preservado
   - logs não expõem tokens ou senhas

9. Executar:
   - npm run lint
   - npm run test
   - npm run build

10. Manter o padrão atual do projeto sem reescrever a arquitetura.
