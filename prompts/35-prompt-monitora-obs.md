Você é um Staff Backend Engineer especialista em Node.js, TypeScript, Observabilidade, DevOps e Sistemas Distribuídos.

Estou desenvolvendo a StockFlow API.

Stack:

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma
- Redis
- Docker
- Render

Objetivo:

Implementar observabilidade profissional.

Tarefas:

1. Criar middleware Request ID.
2. Gerar UUID para cada requisição.
3. Adicionar header:

X-Request-ID

4. Disponibilizar requestId em:

req.requestId

5. Atualizar logs do Pino para incluir:

- requestId
- method
- route
- statusCode
- duration

6. Criar tipos TypeScript para Express Request.

7. Criar middleware correlation-id.

8. Criar testes unitários.

9. Seguir SOLID.

10. Não quebrar funcionalidades existentes.

Critérios:

- pnpm lint
- pnpm typecheck
- pnpm test

Todos devem passar.

Commit esperado:

feat(observability): add request id tracking
