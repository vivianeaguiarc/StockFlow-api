Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, Arquitetura Limpa e APIs REST.

Estou construindo a StockFlow API.

O projeto já possui:

- Express
- Prisma
- PostgreSQL
- Docker
- Error Handler Global
- Estrutura HTTP organizada

Objetivo:

Criar o primeiro módulo da aplicação (Health) para definir o padrão arquitetural que será seguido pelos próximos módulos.

Tarefas:

1. Criar módulo health.
2. Criar HealthController.
3. Criar HealthService.
4. Criar rota do módulo.
5. Registrar a rota no arquivo central de rotas.
6. Manter separação de responsabilidades.
7. Não acessar banco ainda.
8. Não criar autenticação ainda.

Estrutura esperada:

src/
├── modules/
│ └── health/
│ ├── controllers/
│ │ └── HealthController.ts
│ ├── services/
│ │ └── HealthService.ts
│ ├── routes/
│ │ └── health.routes.ts
│ └── dtos/

Regras:

- Controller apenas recebe e responde.
- Service contém lógica.
- Rotas apenas registram endpoints.
- Utilizar classes.
- Utilizar TypeScript estrito.

Endpoint esperado:

GET /api/health

Resposta:

{
"status": "ok",
"service": "StockFlow API",
"timestamp": "2026-06-13T00:00:00.000Z"
}

Critérios de aceitação:

1. GET /api/health deve funcionar.
2. Controller não deve conter regra de negócio.
3. Service deve ser responsável pela resposta.
4. Estrutura deve servir de modelo para os próximos módulos.
5. pnpm lint deve passar.
6. pnpm typecheck deve passar.

Ao finalizar:

- Mostrar os arquivos criados.
- Explicar a responsabilidade de cada camada.
- Explicar como esse padrão será reutilizado nos próximos módulos.
- Sugerir commit seguindo Conventional Commits.

Commit esperado:

feat: create health module
