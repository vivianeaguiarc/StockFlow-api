# StockFlow API

![CI](https://github.com/vivianeaguiarc/StockFlow-api/actions/workflows/ci.yml/badge.svg)

API REST SaaS multiempresa para gestão de estoque, construída com Node.js, TypeScript e PostgreSQL.

**API em produção:** [https://stockflow-api-l4x4.onrender.com/api/docs](https://stockflow-api-l4x4.onrender.com/api/docs) (Swagger)

---

## Descrição

A **StockFlow API** é uma plataforma backend que permite empresas gerenciarem produtos, categorias, fornecedores e movimentações de estoque de forma isolada e segura. Cada empresa opera em seu próprio tenant, com usuários, permissões e dados completamente segregados.

---

## Objetivo do projeto

Demonstrar na prática a construção de uma API profissional de estoque, aplicando:

- arquitetura modular e escalável;
- autenticação JWT e controle de acesso por papéis (RBAC);
- multi-tenancy em todos os módulos de negócio;
- auditoria de ações críticas;
- testes automatizados e pipeline de CI/CD;
- documentação OpenAPI e containerização com Docker.

Ideal para portfólio técnico e estudo de backends SaaS.

> **Deploy em cloud:** guia Render passo a passo em [`docs/render-deploy.md`](docs/render-deploy.md) · visão geral em [`docs/deploy.md`](docs/deploy.md).

---

## Funcionalidades principais

| Módulo         | Descrição                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| **Auth**       | Registro de empresa + admin, login com JWT                                                                 |
| **Companies**  | Perfil da empresa autenticada                                                                              |
| **Users**      | CRUD de usuários com RBAC (ADMIN, MANAGER, USER)                                                           |
| **Categories** | CRUD de categorias de produtos                                                                             |
| **Suppliers**  | CRUD de fornecedores                                                                                       |
| **Products**   | CRUD de produtos com SKU, preços e estoque                                                                 |
| **Inventory**  | Movimentações ENTRY, EXIT e ADJUSTMENT com transação                                                       |
| **Audit**      | Trilha de auditoria imutável (somente ADMIN)                                                               |
| **Health**     | Health check da aplicação (live, ready, details)                                                           |
| **Swagger**    | Documentação interativa — [produção](https://stockflow-api-l4x4.onrender.com/api/docs) · local `/api/docs` |

---

## Tecnologias utilizadas

| Camada       | Tecnologia                          |
| ------------ | ----------------------------------- |
| Runtime      | Node.js 22                          |
| Linguagem    | TypeScript (strict)                 |
| Framework    | Express 5                           |
| ORM          | Prisma                              |
| Banco        | PostgreSQL 17                       |
| Autenticação | JWT + bcryptjs                      |
| Validação    | Zod                                 |
| Testes       | Vitest + Supertest                  |
| Documentação | Swagger (OpenAPI 3)                 |
| Qualidade    | ESLint, Prettier, Husky, commitlint |
| Infra        | Docker, Docker Compose              |
| CI/CD        | GitHub Actions                      |

---

## Arquitetura

Padrão **Controller → Service → Repository → DTOs**, organizado por módulos de domínio (refatoração incremental — Task 50):

```
src/
├── app.ts                 # Factory Express (middlewares + rotas)
├── server.ts              # Entry point — apenas app.listen()
├── config/                # Variáveis de ambiente (Zod)
├── docs/                  # Configuração Swagger/OpenAPI
├── modules/
│   ├── auth/
│   │   ├── controllers/   # HTTP — recebe request/response
│   │   ├── services/      # Regras de negócio (JWT, login, refresh)
│   │   ├── repositories/  # RefreshTokensRepository (Prisma isolado)
│   │   ├── dtos/          # Validação Zod de entrada/saída
│   │   └── routes/
│   ├── users/
│   │   ├── controllers/
│   │   ├── services/      # CRUD, RBAC, cache, soft delete
│   │   ├── repositories/  # UsersRepository (Prisma isolado)
│   │   ├── dtos/
│   │   └── routes/
│   ├── audit/
│   │   ├── services/      # AuditLogService, AuditService
│   │   └── repositories/  # AuditLogsRepository (Prisma isolado)
│   ├── companies/ …       # Outros domínios seguem o mesmo padrão gradual
│   └── health/
└── shared/
    ├── audit/             # Sanitização e contexto de auditoria
    ├── database/          # Prisma singleton (usado só pelos repositories)
    ├── errors/            # AppError
    ├── http/middlewares/  # authenticate, authorizeRoles, validateRequest
    ├── security/          # Rate limiting
    ├── cache/             # Redis client e CacheService
    ├── logger/            # Logs estruturados (Pino)
    ├── types/
    └── utils/             # Paginação, helpers
```

**Responsabilidades:**

| Camada         | Papel                                                  |
| -------------- | ------------------------------------------------------ |
| **Controller** | Traduz HTTP → chama service → formata resposta         |
| **Service**    | Regra de negócio, orquestração, cache, auditoria       |
| **Repository** | Acesso ao banco via Prisma (interface + implementação) |
| **DTO**        | Validação e tipagem de entrada/saída (Zod)             |
| **Middleware** | Auth JWT, RBAC, request ID, rate limit, erros          |

**Fluxo de uma requisição:**

```
HTTP Request
  → global rate limit
  → /api/v1/* (versão atual)
  → /api/* (alias legado temporário)
  → authenticate (JWT + UsersRepository)
  → authorizeRoles (RBAC)
  → validateRequest (Zod)
  → Controller
  → Service (regras de negócio)
  → Repository (Prisma)
  → Response / Error Handler
```

**Repositories implementados (auth, users, audit):** `UsersRepository`, `RefreshTokensRepository`, `AuditLogsRepository`. Demais módulos (products, inventory, etc.) continuam com Prisma nos services até migração futura.

---

## Regras de negócio principais

### Multi-tenancy

- Todo dado pertence a uma `companyId`.
- A empresa vem sempre do token JWT (`req.user.companyId`), nunca do body.
- Empresas não acessam dados umas das outras.

### RBAC

| Papel       | Permissões resumidas                                            |
| ----------- | --------------------------------------------------------------- |
| **ADMIN**   | Acesso total, incluindo auditoria e gestão de usuários          |
| **MANAGER** | CRUD operacional (sem deletar usuários/categorias/fornecedores) |
| **USER**    | Consultas e movimentação de estoque (sem listar histórico)      |

### Estoque (Inventory)

- **ENTRY** — aumenta o estoque.
- **EXIT** — reduz o estoque (bloqueia se insuficiente).
- **ADJUSTMENT** — define quantidade final (campo `quantity` = valor final).
- Movimentação e atualização do produto ocorrem na **mesma transação Prisma**.

### Segurança

Hardening alinhado a boas práticas OWASP e LGPD:

| Camada                 | Implementação                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Helmet**             | Headers HTTP seguros (`X-Content-Type-Options`, `X-Frame-Options`, CSP compatível com Swagger)              |
| **CORS**               | Origins permitidas via `CORS_ORIGINS` (lista separada por vírgula); produção bloqueia origins desconhecidas |
| **Payload**            | Limite de `1mb` em JSON e `urlencoded`                                                                      |
| **Sanitização**        | Middleware remove tags `<script>` e `javascript:` de strings em body/query                                  |
| **Rate limit**         | Global + limiters dedicados para login, refresh e register (Redis store quando disponível)                  |
| **Brute force**        | Login limitado por **IP + email**; mensagem genérica para credenciais inválidas                             |
| **JWT**                | `HS256` obrigatório, `JWT_SECRET` mínimo de 32 chars em produção, access token curto (`JWT_EXPIRES_IN`)     |
| **Refresh token**      | Armazenado apenas como hash; rotação no refresh; revogação no logout                                        |
| **Erros**              | Resposta padronizada `{ status, message, requestId }` — sem stack trace em produção                         |
| **LGPD / Soft delete** | Dados sensíveis nunca em logs/respostas; exclusão lógica via `deletedAt`                                    |

#### Rate limiting

| Escopo   | Padrão           | Janela     | Chave      |
| -------- | ---------------- | ---------- | ---------- |
| Global   | 100 req/IP       | 15 minutos | IP         |
| Login    | 5 tentativas     | 15 minutos | IP + email |
| Refresh  | 10 tentativas/IP | 15 minutos | IP         |
| Register | 10 tentativas/IP | 1 hora     | IP         |

- Resposta `429`: `{ "status": "error", "message": "Too many requests", "requestId": "..." }`.
- Store Redis (`rate-limit-redis`) quando `CACHE_ENABLED` e Redis estão disponíveis; fallback em memória.
- Swagger e health checks isentos do limite global.
- Desabilitado em `NODE_ENV=test`.

Variáveis: `RATE_LIMIT_*`, `CORS_ORIGINS`, `JWT_SECRET`, `JWT_EXPIRES_IN` — ver `.env.example`.

### Versionamento de API

- **Versão atual:** `/api/v1` (configurável via `API_PREFIX`)
- **Compatibilidade:** rotas legadas em `/api/*` permanecem disponíveis temporariamente com o mesmo comportamento
- **Documentação:** Swagger descreve exclusivamente `/api/v1`
- **Evolução:** novas versões (`/api/v2`) poderão ser adicionadas sem quebrar clientes em `/api/v1`

Exemplos:

```http
GET /api/v1/health
GET /api/v1/health/live
GET /api/v1/health/ready
GET /api/v1/health/details
POST /api/v1/auth/login
GET /api/v1/products
```

### Padrão de respostas da API

Todas as respostas JSON seguem um contrato consistente para facilitar o consumo pelo frontend.

**Sucesso (recurso único ou ação):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

**Sucesso paginado:**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Erro padronizado (400, 401, 403, 404, 409, 429, 500):**

```json
{
  "success": false,
  "message": "Validation error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

- Helpers HTTP: `successResponse`, `paginatedResponse`, `errorResponse` em `src/shared/http/api-response.ts`
- `DELETE` e `logout` retornam **204 No Content** sem corpo
- Respostas **nunca** incluem `password`, `passwordHash`, stack trace em produção ou tokens em logs
- `requestId` espelha o header `X-Request-ID` para rastreamento

### Health checks

| Endpoint                     | Propósito                                                        | Autenticação |
| ---------------------------- | ---------------------------------------------------------------- | ------------ |
| `GET /api/v1/health`         | Compatibilidade — status básico                                  | Não          |
| `GET /api/v1/health/live`    | **Liveness** — processo vivo (Kubernetes)                        | Não          |
| `GET /api/v1/health/ready`   | **Readiness** — PostgreSQL disponível (503 se DB down)           | Não          |
| `GET /api/v1/health/details` | **Diagnóstico** — versão, ambiente, uptime, status de DB e Redis | Não          |

- **Liveness (`/live`):** responde 200 se a aplicação está em execução; não consulta dependências externas.
- **Readiness (`/ready`):** valida PostgreSQL (essencial). Redis é reportado, mas indisponibilidade do Redis não bloqueia tráfego (cache com fallback).
- **Details (`/details`):** informações operacionais sem dados sensíveis; Redis aparece como `down` quando indisponível.

---

Consultas pesadas de leitura usam cache Redis com fallback seguro para PostgreSQL:

| Escopo    | Endpoints cacheados                                     | TTL        |
| --------- | ------------------------------------------------------- | ---------- |
| Dashboard | `summary`, `low-stock-products`, `recent-movements`     | 300s       |
| Products  | `GET /api/v1/products` (por combinação de query params) | 300s       |
| Users     | `GET /api/v1/users`, `GET /api/v1/users/:id`            | 60s / 300s |
| Auth      | `GET /api/v1/auth/me`                                   | 300s       |

- **TTL listagens:** 60 segundos (`users:list`).
- **TTL detalhes:** 300 segundos (`users:id`, `auth:me`, dashboard, products).
- **TTL padrão global:** 300 segundos (`CACHE_TTL_SECONDS`).
- **Chaves:** `stockflow:{companyId}:users:list:{hash}`, `stockflow:{companyId}:users:id:{id}`, `stockflow:auth:me:{userId}` — isolamento por tenant nas listagens.
- **Invalidação:** automática após create/update/soft delete de usuário; produtos e movimentações de estoque invalidam cache relacionado.
- **Resiliência:** se Redis estiver indisponível, a API continua respondendo via banco.
- **Testes:** cache desabilitado automaticamente quando `NODE_ENV=test`.

Subir Redis localmente:

```bash
pnpm db:up
# ou: docker compose up -d redis
# stack completa (API + Postgres + Redis): docker compose up -d
```

### Auditoria

- Logs criados internamente pelos services (sem rota pública de escrita).
- Registra ação, entidade, valores anterior/novo, IP e User-Agent.
- Nunca armazena senha, hash ou tokens.

### Soft delete

- Usuários, categorias, fornecedores e produtos usam `deletedAt` (não removem fisicamente).

---

## Como rodar localmente

### Pré-requisitos

- Node.js >= 20
- pnpm >= 11
- Docker e Docker Compose

### 1. Clonar e instalar

```bash
git clone <url-do-repositorio>
cd stockflow-api
pnpm install
cp .env.example .env
```

Edite o `.env` e defina um `JWT_SECRET` seguro para desenvolvimento.

### 2. Subir apenas PostgreSQL (e Redis, opcional)

```bash
pnpm db:up
# ou: docker compose -f docker-compose.infra.yml up -d
```

Para subir só o Postgres: `docker compose up -d postgres`

### 3. Banco de dados

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed        # opcional — dados demo
```

### 4. Iniciar a API

```bash
pnpm dev
```

A API estará disponível em `http://localhost:3333`.

---

## Executando com Docker

Sobe **PostgreSQL + API** com um único comando (migrations aplicadas automaticamente no startup):

```bash
docker compose up -d
```

Ou via script:

```bash
pnpm docker:up
```

A API ficará em `http://localhost:3333` · Swagger em `http://localhost:3333/api/docs`

### Comandos úteis

| Comando            | Descrição                                                         |
| ------------------ | ----------------------------------------------------------------- |
| `pnpm docker:up`   | Build + sobe API e PostgreSQL                                     |
| `pnpm docker:down` | Para e remove containers                                          |
| `pnpm docker:logs` | Logs da API em tempo real                                         |
| `pnpm docker:dev`  | Desenvolvimento com hot reload (overlay `docker-compose.dev.yml`) |

### Desenvolvimento com hot reload (Docker)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

O código local é montado em volume; alterações em `src/` recarregam a API automaticamente.

### Verificar saúde

```bash
curl http://localhost:3333/api/v1/health/live
curl http://localhost:3333/api/v1/health/ready
```

### Parar

```bash
docker compose down
```

> **Nota:** se a porta `3333` já estiver em uso (ex.: `pnpm dev`), pare o processo local antes de subir o container da API.

> **Windows / macOS / Linux:** use Docker Desktop ou Docker Engine com Compose V2 (`docker compose`). O `docker-entrypoint.sh` é normalizado para LF no build da imagem.

---

## Deploy em produção

**Serviço ativo no Render:** [https://stockflow-api-l4x4.onrender.com](https://stockflow-api-l4x4.onrender.com)

| Recurso        | URL                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| **API (v1)**   | [https://stockflow-api-l4x4.onrender.com/api/v1](https://stockflow-api-l4x4.onrender.com/api/v1)               |
| **Swagger UI** | [https://stockflow-api-l4x4.onrender.com/api/docs](https://stockflow-api-l4x4.onrender.com/api/docs)           |
| **Health**     | [https://stockflow-api-l4x4.onrender.com/api/v1/health](https://stockflow-api-l4x4.onrender.com/api/v1/health) |
| **Readiness**  | [https://stockflow-api-l4x4.onrender.com/api/v1/ready](https://stockflow-api-l4x4.onrender.com/api/v1/ready)   |

Guia passo a passo: **[docs/render-deploy.md](docs/render-deploy.md)** · Blueprint: [`render.yaml`](render.yaml) · outras plataformas: **[docs/deploy.md](docs/deploy.md)**

### Comandos no Render

| Etapa          | Comando                                                            |
| -------------- | ------------------------------------------------------------------ |
| **Build**      | `pnpm install --frozen-lockfile && pnpm db:generate && pnpm build` |
| **Migrations** | `pnpm db:migrate:deploy` (Pre-Deploy Command)                      |
| **Start**      | `pnpm start` (`node dist/server.js`)                               |

**Health Check Path (Render):** `/api/v1/health`

> Secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`, etc.) são configurados **apenas no painel Render** — nunca commite `.env` com valores reais.

### Docker (recomendado para VPS / stack local)

```bash
docker compose build
docker compose up -d
```

A imagem de produção:

- Build multi-stage com `pnpm install --frozen-lockfile`, `prisma generate` e `tsc`
- Executa apenas `node dist/server.js` (TypeScript compilado)
- `NODE_ENV=production`, usuário **não-root** (`stockflow`)
- Health check interno: `GET /api/v1/health`
- Migrations via `docker-entrypoint.sh` → `pnpm db:migrate:deploy`

### Render (PaaS)

1. Crie **PostgreSQL** e **Key Value (Redis)** na mesma região.
2. Conecte o repositório ou aplique o blueprint [`render.yaml`](render.yaml).
3. Configure os comandos:

| Campo              | Valor                                                              |
| ------------------ | ------------------------------------------------------------------ |
| Build Command      | `pnpm install --frozen-lockfile && pnpm db:generate && pnpm build` |
| Pre-Deploy Command | `pnpm db:migrate:deploy`                                           |
| Start Command      | `pnpm start`                                                       |
| Health Check Path  | `/api/v1/health`                                                   |

4. Defina variáveis de ambiente no painel (nunca commite secrets reais).
5. Deploy automático a cada push; valide com `GET /api/v1/ready` para readiness completo.

### Variáveis de ambiente obrigatórias (produção)

| Variável             | Descrição                                               |
| -------------------- | ------------------------------------------------------- |
| `NODE_ENV`           | `production`                                            |
| `PORT`               | Injetado pela plataforma (Render) — não sobrescreva     |
| `DATABASE_URL`       | PostgreSQL (Internal URL no Render)                     |
| `JWT_ACCESS_SECRET`  | Secret do access token (min. 32 chars; ou `JWT_SECRET`) |
| `JWT_REFRESH_SECRET` | Pepper para hash de refresh tokens (min. 32 chars)      |
| `REDIS_URL`          | Obrigatório quando `CACHE_ENABLED=true`                 |
| `CORS_ORIGINS`       | Origins permitidas (vírgula) ou `CORS_ORIGIN` única     |
| `RATE_LIMIT_ENABLED` | `true` em produção                                      |

Recomendadas: `PUBLIC_URL` (Swagger), `HOST=0.0.0.0`, `HUSKY=0`, `TRUST_PROXY=true`.

Referência completa: [`.env.example`](.env.example)

### Health check

| Endpoint             | Uso                                                        |
| -------------------- | ---------------------------------------------------------- |
| `GET /api/v1/health` | **Plataforma** — liveness simples (Render, Docker, LB)     |
| `GET /api/v1/ready`  | **Readiness** — valida PostgreSQL (503 se DB indisponível) |

```bash
curl https://stockflow-api-l4x4.onrender.com/api/v1/health
curl https://stockflow-api-l4x4.onrender.com/api/v1/ready
```

### Migrations em produção

```bash
# Render Pre-Deploy / CI / release command
pnpm db:migrate:deploy
# equivalente: npx prisma migrate deploy
```

Nunca use `prisma migrate dev` em produção. O `docker-entrypoint.sh` também aplica migrations no startup do container.

### Swagger em produção

| Recurso          | URL                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Swagger UI**   | [https://stockflow-api-l4x4.onrender.com/api/docs](https://stockflow-api-l4x4.onrender.com/api/docs)                           |
| **OpenAPI JSON** | [https://stockflow-api-l4x4.onrender.com/api/docs/openapi.json](https://stockflow-api-l4x4.onrender.com/api/docs/openapi.json) |

O servidor **Production** no Swagger aponta para `https://stockflow-api-l4x4.onrender.com/api/v1`. Defina `PUBLIC_URL` no Render se o domínio mudar.

### Proxy reverso

Com `TRUST_PROXY=true` (padrão em produção/Docker), a API confia no primeiro proxy (`app.set('trust proxy', 1)`) para IP real em rate limit e auditoria — necessário no Render, Railway e load balancers.

---

## Migrations

```bash
# Desenvolvimento — cria e aplica migration
pnpm db:migrate

# Produção / CI / Render — aplica migrations existentes
pnpm db:migrate:deploy
```

Schema: `prisma/schema.prisma`

---

## Backup e restore (PostgreSQL)

Scripts para ambiente **local/desenvolvimento**. Credenciais vêm do `.env` (`POSTGRES_*` ou `DATABASE_URL`) — nunca são commitadas.

### Pré-requisitos

- PostgreSQL acessível (via `pnpm db:up` / Docker Compose ou instalação local)
- Bash disponível (Git Bash, WSL ou Linux/macOS)
- Para modo local (sem Docker): `pg_dump`, `pg_restore` e `psql` no PATH

### Gerar backup

```bash
pnpm db:backup
```

Gera um arquivo em `backups/` com timestamp, por exemplo:

```text
backups/stockflow_db_20260613_120000.dump
```

Formato: PostgreSQL custom (`pg_dump -F c`), compacto e adequado para `pg_restore`.

### Restaurar backup

```bash
pnpm db:restore backups/stockflow_db_20260613_120000.dump
```

Também aceita dumps `.sql` (plain SQL). O script aguarda 5 segundos antes de executar — use `Ctrl+C` para cancelar.

> **Atenção:** restore sobrescreve dados do banco alvo. Use apenas em desenvolvimento.

### Comportamento

| Cenário                                         | Ferramenta                                       |
| ----------------------------------------------- | ------------------------------------------------ |
| Container `postgres` rodando (`docker compose`) | `pg_dump` / `pg_restore` / `psql` via Docker     |
| PostgreSQL local na máquina                     | Clientes PostgreSQL locais + variáveis do `.env` |

Arquivos em `backups/*.sql` e `backups/*.dump` estão no `.gitignore` — dumps reais **não** são versionados.

---

## Seed

Popula empresa demo e usuário admin:

```bash
pnpm db:seed
```

| Campo | Valor                 |
| ----- | --------------------- |
| Email | `admin@stockflow.com` |
| Senha | `Admin@123456`        |

> Use apenas em ambiente de desenvolvimento.

---

## Testes

```bash
pnpm test              # executa todos os testes
pnpm test:watch        # modo watch
pnpm test:coverage     # com relatório de cobertura
```

Os testes E2E usam Supertest importando `createApp()` diretamente — **não é necessário** subir o servidor manualmente. PostgreSQL deve estar rodando.

Estrutura:

```
tests/
├── e2e/           # Testes HTTP (auth, companies, users, etc.)
├── helpers/       # Factory de empresa, login, cleanup
└── setup.ts       # dotenv + disconnect Prisma
```

---

## Swagger

Documentação interativa **OpenAPI 3.0**:

| Ambiente              | Swagger UI                                                                                           | OpenAPI JSON                                                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Produção (Render)** | [https://stockflow-api-l4x4.onrender.com/api/docs](https://stockflow-api-l4x4.onrender.com/api/docs) | [https://stockflow-api-l4x4.onrender.com/api/docs/openapi.json](https://stockflow-api-l4x4.onrender.com/api/docs/openapi.json) |
| **Local**             | `http://localhost:3333/api/docs`                                                                     | `http://localhost:3333/api/docs/openapi.json`                                                                                  |
| **Docker**            | `http://localhost:3333/api/docs` (mesma porta do container `api`)                                    | `http://localhost:3333/api/docs/openapi.json`                                                                                  |

Rotas versionadas em `/api/v1`. Tags principais: **Auth**, **Users**, **Health**, **Audit**.

**Como autenticar no Swagger:**

1. Faça login em `POST /api/v1/auth/login`.
2. Copie o `accessToken` da resposta.
3. Clique em **Authorize** e cole o token (sem o prefixo `Bearer`).

Headers opcionais: `X-Request-ID` (UUID) para rastreamento — a API devolve o mesmo valor no header de resposta.

## Variáveis de ambiente

| Variável             | Descrição                         | Exemplo / notas                           |
| -------------------- | --------------------------------- | ----------------------------------------- |
| `NODE_ENV`           | Ambiente                          | `development` · `production` no Render    |
| `PORT`               | Porta HTTP                        | `3333` local · injetado pelo Render       |
| `API_PREFIX`         | Prefixo versionado da API         | `/api/v1`                                 |
| `DATABASE_URL`       | Connection string PostgreSQL      | ver `.env.example`                        |
| `JWT_ACCESS_SECRET`  | Secret do access token (prod.)    | min. 32 chars (ou `JWT_SECRET` legado)    |
| `JWT_REFRESH_SECRET` | Pepper do refresh token (prod.)   | min. 32 chars                             |
| `JWT_SECRET`         | Legado — fallback do access token | dev local                                 |
| `JWT_EXPIRES_IN`     | Expiração do access token         | `15m`                                     |
| `CORS_ORIGINS`       | Origins permitidas (vírgula)      | produção                                  |
| `CORS_ORIGIN`        | Alias para uma única origin       | produção                                  |
| `RATE_LIMIT_ENABLED` | Rate limiting                     | `true` em produção                        |
| `REDIS_URL`          | Redis / Key Value                 | obrigatório se `CACHE_ENABLED=true`       |
| `CACHE_ENABLED`      | Cache Redis                       | `true` em produção                        |
| `TRUST_PROXY`        | IP real atrás de proxy            | `true` no Render                          |
| `PUBLIC_URL`         | URL pública (Swagger)             | `https://stockflow-api-l4x4.onrender.com` |
| `POSTGRES_USER`      | Usuário Postgres (Docker local)   | `stockflow`                               |
| `POSTGRES_PASSWORD`  | Senha Postgres (Docker local)     | `stockflow`                               |
| `POSTGRES_DB`        | Nome do banco (Docker local)      | `stockflow_db`                            |

Referência completa: [`.env.example`](.env.example)

---

## Scripts disponíveis

| Script                   | Descrição                                          |
| ------------------------ | -------------------------------------------------- |
| `pnpm dev`               | Desenvolvimento com hot reload                     |
| `pnpm build`             | Compila TypeScript → `dist/`                       |
| `pnpm start`             | Produção (`node dist/server.js`)                   |
| `pnpm lint`              | ESLint                                             |
| `pnpm lint:fix`          | ESLint com auto-fix                                |
| `pnpm format`            | Prettier (write)                                   |
| `pnpm format:check`      | Prettier (check)                                   |
| `pnpm typecheck`         | Verificação de tipos                               |
| `pnpm test`              | Testes (Vitest)                                    |
| `pnpm test:watch`        | Testes em watch mode                               |
| `pnpm test:coverage`     | Cobertura de testes                                |
| `pnpm db:up`             | Sobe Postgres + Redis (`docker-compose.infra.yml`) |
| `pnpm db:down`           | Para infra local                                   |
| `pnpm docker:up`         | Build + sobe API + Postgres (produção)             |
| `pnpm docker:down`       | Para stack Docker da API                           |
| `pnpm docker:logs`       | Logs do container da API                           |
| `pnpm docker:dev`        | API em Docker com hot reload                       |
| `pnpm db:logs`           | Logs do PostgreSQL                                 |
| `pnpm db:generate`       | `prisma generate`                                  |
| `pnpm db:migrate`        | `prisma migrate dev`                               |
| `pnpm db:migrate:deploy` | `prisma migrate deploy` (produção)                 |
| `pnpm db:studio`         | Prisma Studio (GUI)                                |
| `pnpm db:seed`           | Seed do banco                                      |
| `pnpm db:backup`         | Backup PostgreSQL → `backups/`                     |
| `pnpm db:restore`        | Restore a partir de arquivo                        |

---

## Principais rotas

> Rotas versionadas em **`/api/v1`**. O prefixo `/api` permanece como alias legado temporário.

### Públicas

| Método | Rota                     | Descrição                    |
| ------ | ------------------------ | ---------------------------- |
| GET    | `/`                      | Metadados da API e links     |
| HEAD   | `/`                      | Disponibilidade da raiz      |
| GET    | `/api/v1/health`         | Health check básico (legado) |
| GET    | `/api/v1/health/live`    | Liveness probe               |
| GET    | `/api/v1/health/ready`   | Readiness probe              |
| GET    | `/api/v1/health/details` | Status detalhado             |
| GET    | `/api/docs`              | Swagger UI                   |
| GET    | `/api/docs/openapi.json` | OpenAPI 3.0 JSON spec        |
| POST   | `/api/v1/auth/register`  | Registrar empresa + admin    |
| POST   | `/api/v1/auth/login`     | Login (retorna JWT)          |
| POST   | `/api/v1/auth/refresh`   | Renovar tokens               |
| POST   | `/api/v1/auth/logout`    | Logout (revoga refresh)      |

### Autenticadas

| Método | Rota                          | RBAC                                       | Descrição                     |
| ------ | ----------------------------- | ------------------------------------------ | ----------------------------- |
| GET    | `/api/v1/me`                  | Todos                                      | Usuário autenticado (legado)  |
| GET    | `/api/v1/auth/me`             | Todos                                      | Perfil do usuário autenticado |
| GET    | `/api/v1/companies/me`        | Todos                                      | Perfil da empresa             |
| PATCH  | `/api/v1/companies/me`        | ADMIN                                      | Atualizar empresa             |
| CRUD   | `/api/v1/users`               | ADMIN (list/delete); ADMIN/MANAGER (patch) | Gestão de usuários            |
| CRUD   | `/api/v1/categories`          | ADMIN / MANAGER / USER\*                   | Categorias                    |
| CRUD   | `/api/v1/suppliers`           | ADMIN / MANAGER / USER\*                   | Fornecedores                  |
| CRUD   | `/api/v1/products`            | ADMIN / MANAGER / USER\*                   | Produtos                      |
| POST   | `/api/v1/inventory/movements` | ADMIN / MANAGER / USER                     | Movimentar estoque            |
| GET    | `/api/v1/inventory/movements` | ADMIN / MANAGER                            | Histórico de movimentações    |
| GET    | `/api/v1/dashboard/summary`   | ADMIN / MANAGER                            | Métricas do dashboard         |
| GET    | `/api/v1/audit/logs`          | ADMIN                                      | Logs de auditoria             |

\* USER: somente leitura (GET).

### Exemplo — Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@stockflow.com",
  "password": "Admin@123456"
}
```

### Exemplo — Movimentação de estoque

```http
POST /api/v1/inventory/movements
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "clx...",
  "type": "ENTRY",
  "quantity": 10,
  "reason": "Compra de fornecedor"
}
```

---

## Estrutura de pastas (raiz)

```
stockflow-api/
├── .github/workflows/     # CI (GitHub Actions)
├── docs/
│   ├── deploy.md          # Guia de deploy em cloud (geral)
│   └── render-deploy.md   # Deploy passo a passo no Render
├── prisma/
│   ├── migrations/        # Migrations SQL
│   ├── schema.prisma      # Modelos e enums
│   └── seed.ts            # Dados iniciais
├── src/                   # Código-fonte TypeScript
├── tests/                 # Testes E2E + helpers
├── docker-compose.yml         # API + PostgreSQL (produção)
├── docker-compose.dev.yml     # Overlay: hot reload
├── docker-compose.infra.yml   # Postgres + Redis (dev local sem API)
├── Dockerfile                 # Multi-stage build
├── docker-entrypoint.sh       # Migrations + startup
├── vitest.config.ts
├── .env.example
└── package.json
```

---

## Status do projeto

| Área                                          | Status    |
| --------------------------------------------- | --------- |
| Auth + JWT                                    | Concluído |
| RBAC + Multi-tenancy                          | Concluído |
| CRUD (Users, Categories, Suppliers, Products) | Concluído |
| Inventory Movements                           | Concluído |
| Audit Logs                                    | Concluído |
| Swagger / OpenAPI                             | Concluído |
| Testes E2E (Vitest + Supertest)               | Concluído |
| Docker + Docker Compose                       | Concluído |
| CI/CD (GitHub Actions)                        | Concluído |
| Deploy em produção (Docker + Render)          | Concluído |

---

## Próximos passos

- [ ] Refresh token e logout com invalidação
- [x] Rate limiting e proteções adicionais
- [ ] Notificações de estoque mínimo
- [ ] Relatórios e dashboards de inventário
- [x] Deploy em cloud (Render + Docker)
- [ ] Observabilidade (logs estruturados, métricas)

---

## CI/CD

A cada push ou pull request nas branches `main` e `develop`, o GitHub Actions executa:

```
pnpm install → lint → prisma generate → migrate deploy → test → build → test:coverage
```

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## Autor

**Viviane Aguiar**

Desenvolvedora backend com foco em Node.js, TypeScript, APIs REST, PostgreSQL e arquitetura de software. Este projeto faz parte do meu portfólio técnico, demonstrando a construção de uma API SaaS multiempresa com autenticação, RBAC, multi-tenancy, auditoria, testes automatizados e CI/CD.

|          |                                                                               |
| -------- | ----------------------------------------------------------------------------- |
| LinkedIn | [linkedin.com/in/vivianeaguiarc](https://www.linkedin.com/in/vivianeaguiarc/) |
| E-mail   | vivianeaguiarc@outlook.com                                                    |

---

## Licença

ISC
