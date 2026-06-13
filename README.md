# StockFlow API

API REST SaaS multiempresa para gestão de estoque, construída com Node.js, TypeScript e PostgreSQL.

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

---

## Funcionalidades principais

| Módulo         | Descrição                                                               |
| -------------- | ----------------------------------------------------------------------- |
| **Auth**       | Registro de empresa + admin, login com JWT                              |
| **Companies**  | Perfil da empresa autenticada                                           |
| **Users**      | CRUD de usuários com RBAC (ADMIN, MANAGER, EMPLOYEE)                    |
| **Categories** | CRUD de categorias de produtos                                          |
| **Suppliers**  | CRUD de fornecedores                                                    |
| **Products**   | CRUD de produtos com SKU, preços e estoque                              |
| **Inventory**  | Movimentações ENTRY, EXIT e ADJUSTMENT com transação                    |
| **Audit**      | Trilha de auditoria imutável (somente ADMIN)                            |
| **Health**     | Health check da aplicação                                               |
| **Swagger**    | Documentação interativa em `/api/docs` (rotas versionadas em `/api/v1`) |

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

Padrão **Controller → Service → Routes → DTOs**, organizado por módulos de domínio:

```
src/
├── app.ts                 # Factory Express (middlewares + rotas)
├── server.ts              # Entry point — apenas app.listen()
├── config/                # Variáveis de ambiente (Zod)
├── docs/                  # Configuração Swagger/OpenAPI
├── modules/
│   ├── auth/
│   ├── companies/
│   ├── users/
│   ├── categories/
│   ├── suppliers/
│   ├── products/
│   ├── inventory/
│   ├── audit/
│   └── health/
└── shared/
    ├── audit/             # Sanitização e contexto de auditoria
    ├── database/          # Prisma singleton
    ├── errors/            # AppError
    ├── http/              # Rotas centrais, middlewares, responses
    ├── middlewares/
    ├── security/            # Rate limiting e proteções HTTP
    ├── cache/               # Redis client e CacheService
    ├── logger/              # Logs estruturados (Pino)
    ├── types/
    └── utils/             # Paginação, helpers
```

**Fluxo de uma requisição:**

```
HTTP Request
  → global rate limit
  → /api/v1/* (versão atual)
  → /api/* (alias legado temporário)
  → authenticate (JWT)
  → authorizeRoles (RBAC)
  → validateRequest (Zod)
  → Controller
  → Service (regras + Prisma)
  → Response / Error Handler
```

---

## Regras de negócio principais

### Multi-tenancy

- Todo dado pertence a uma `companyId`.
- A empresa vem sempre do token JWT (`req.user.companyId`), nunca do body.
- Empresas não acessam dados umas das outras.

### RBAC

| Papel        | Permissões resumidas                                            |
| ------------ | --------------------------------------------------------------- |
| **ADMIN**    | Acesso total, incluindo auditoria e gestão de usuários          |
| **MANAGER**  | CRUD operacional (sem deletar usuários/categorias/fornecedores) |
| **EMPLOYEE** | Consultas e movimentação de estoque (sem listar histórico)      |

### Estoque (Inventory)

- **ENTRY** — aumenta o estoque.
- **EXIT** — reduz o estoque (bloqueia se insuficiente).
- **ADJUSTMENT** — define quantidade final (campo `quantity` = valor final).
- Movimentação e atualização do produto ocorrem na **mesma transação Prisma**.

### Rate limiting

Proteção contra abuso de API com `express-rate-limit`:

| Escopo   | Padrão           | Janela     |
| -------- | ---------------- | ---------- |
| Global   | 100 req/IP       | 15 minutos |
| Login    | 5 tentativas/IP  | 15 minutos |
| Register | 10 tentativas/IP | 1 hora     |

- Resposta ao exceder limite: `429` com `{ "status": "error", "message": "Too many requests" }`.
- Swagger (`/api/docs`) **não** entra no rate limit global.
- Desabilitado automaticamente quando `NODE_ENV=test` (testes E2E).
- Limites configuráveis via variáveis `RATE_LIMIT_*` (ver `.env.example`).

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

| Escopo    | Endpoints cacheados                                     |
| --------- | ------------------------------------------------------- |
| Dashboard | `summary`, `low-stock-products`, `recent-movements`     |
| Products  | `GET /api/v1/products` (por combinação de query params) |

- **TTL padrão:** 300 segundos (`CACHE_TTL_SECONDS`).
- **Chaves:** `stockflow:{companyId}:...` — isolamento total por tenant.
- **Invalidação:** automática após create/update/delete de produto ou movimentação de estoque.
- **Resiliência:** se Redis estiver indisponível, a API continua respondendo via banco.
- **Testes:** cache desabilitado automaticamente quando `NODE_ENV=test`.

Subir Redis localmente: `docker compose up -d redis`

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

### 2. Subir apenas o PostgreSQL

```bash
docker compose up -d postgres
```

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

## Como rodar com Docker

Sobe **PostgreSQL + API** em containers (migrations executadas automaticamente no startup):

```bash
docker compose up --build -d
```

Verificar saúde:

```bash
curl http://localhost:3333/api/v1/health/live
curl http://localhost:3333/api/v1/health/ready
curl http://localhost:3333/api/v1/health/details
```

Ver logs:

```bash
docker compose logs -f api
```

Parar:

```bash
docker compose down
```

> **Nota:** se a porta `3333` já estiver em uso (ex.: `pnpm dev`), pare o processo local antes de subir o container da API.

---

## Migrations

```bash
# Desenvolvimento — cria e aplica migration
pnpm db:migrate

# Produção / CI — aplica migrations existentes
pnpm prisma migrate deploy
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

Documentação interativa disponível em:

```
http://localhost:3333/api/docs
```

**Como autenticar no Swagger:**

1. Faça login em `POST /api/v1/auth/login`.
2. Copie o `accessToken` da resposta.
3. Clique em **Authorize** e cole o token (sem o prefixo `Bearer`).

---

## Variáveis de ambiente

| Variável            | Descrição                    | Exemplo                   |
| ------------------- | ---------------------------- | ------------------------- |
| `NODE_ENV`          | Ambiente                     | `development`             |
| `PORT`              | Porta HTTP                   | `3333`                    |
| `API_PREFIX`        | Prefixo versionado da API    | `/api/v1`                 |
| `DATABASE_URL`      | Connection string PostgreSQL | ver `.env.example`        |
| `JWT_SECRET`        | Chave secreta do JWT         | _(defina um valor forte)_ |
| `JWT_EXPIRES_IN`    | Expiração do token           | `7d`                      |
| `POSTGRES_USER`     | Usuário do Postgres (Docker) | `stockflow`               |
| `POSTGRES_PASSWORD` | Senha do Postgres (Docker)   | `stockflow`               |
| `POSTGRES_DB`       | Nome do banco (Docker)       | `stockflow_db`            |

Referência completa: [`.env.example`](.env.example)

---

## Scripts disponíveis

| Script               | Descrição                        |
| -------------------- | -------------------------------- |
| `pnpm dev`           | Desenvolvimento com hot reload   |
| `pnpm build`         | Compila TypeScript → `dist/`     |
| `pnpm start`         | Produção (`node dist/server.js`) |
| `pnpm lint`          | ESLint                           |
| `pnpm lint:fix`      | ESLint com auto-fix              |
| `pnpm format`        | Prettier (write)                 |
| `pnpm format:check`  | Prettier (check)                 |
| `pnpm typecheck`     | Verificação de tipos             |
| `pnpm test`          | Testes (Vitest)                  |
| `pnpm test:watch`    | Testes em watch mode             |
| `pnpm test:coverage` | Cobertura de testes              |
| `pnpm db:up`         | `docker compose up -d`           |
| `pnpm db:down`       | `docker compose down`            |
| `pnpm db:logs`       | Logs do PostgreSQL               |
| `pnpm db:generate`   | `prisma generate`                |
| `pnpm db:migrate`    | `prisma migrate dev`             |
| `pnpm db:studio`     | Prisma Studio (GUI)              |
| `pnpm db:seed`       | Seed do banco                    |
| `pnpm db:backup`     | Backup PostgreSQL → `backups/`   |
| `pnpm db:restore`    | Restore a partir de arquivo      |

---

## Principais rotas

> Rotas versionadas em **`/api/v1`**. O prefixo `/api` permanece como alias legado temporário.

### Públicas

| Método | Rota                     | Descrição                    |
| ------ | ------------------------ | ---------------------------- |
| GET    | `/api/v1/health`         | Health check básico (legado) |
| GET    | `/api/v1/health/live`    | Liveness probe               |
| GET    | `/api/v1/health/ready`   | Readiness probe              |
| GET    | `/api/v1/health/details` | Status detalhado             |
| GET    | `/api/docs`              | Swagger UI                   |
| POST   | `/api/v1/auth/register`  | Registrar empresa + admin    |
| POST   | `/api/v1/auth/login`     | Login (retorna JWT)          |
| POST   | `/api/v1/auth/refresh`   | Renovar tokens               |
| POST   | `/api/v1/auth/logout`    | Logout (revoga refresh)      |

### Autenticadas

| Método | Rota                          | RBAC                         | Descrição                  |
| ------ | ----------------------------- | ---------------------------- | -------------------------- |
| GET    | `/api/v1/me`                  | Todos                        | Usuário autenticado        |
| GET    | `/api/v1/companies/me`        | Todos                        | Perfil da empresa          |
| PATCH  | `/api/v1/companies/me`        | ADMIN                        | Atualizar empresa          |
| CRUD   | `/api/v1/users`               | ADMIN / MANAGER              | Gestão de usuários         |
| CRUD   | `/api/v1/categories`          | ADMIN / MANAGER / EMPLOYEE\* | Categorias                 |
| CRUD   | `/api/v1/suppliers`           | ADMIN / MANAGER / EMPLOYEE\* | Fornecedores               |
| CRUD   | `/api/v1/products`            | ADMIN / MANAGER / EMPLOYEE\* | Produtos                   |
| POST   | `/api/v1/inventory/movements` | ADMIN / MANAGER / EMPLOYEE   | Movimentar estoque         |
| GET    | `/api/v1/inventory/movements` | ADMIN / MANAGER              | Histórico de movimentações |
| GET    | `/api/v1/dashboard/summary`   | ADMIN / MANAGER              | Métricas do dashboard      |
| GET    | `/api/v1/audit/logs`          | ADMIN                        | Logs de auditoria          |

\* EMPLOYEE: somente leitura (GET).

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
├── prisma/
│   ├── migrations/        # Migrations SQL
│   ├── schema.prisma      # Modelos e enums
│   └── seed.ts            # Dados iniciais
├── src/                   # Código-fonte TypeScript
├── tests/                 # Testes E2E + helpers
├── docker-compose.yml     # PostgreSQL + API
├── Dockerfile             # Imagem da API
├── docker-entrypoint.sh   # Migrations + startup
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

---

## Próximos passos

- [ ] Refresh token e logout com invalidação
- [ ] Rate limiting e proteções adicionais
- [ ] Notificações de estoque mínimo
- [ ] Relatórios e dashboards de inventário
- [ ] Deploy em cloud (Railway, Render, AWS)
- [ ] Observabilidade (logs estruturados, métricas)

---

## CI/CD

A cada push e pull request, o GitHub Actions executa:

```
pnpm install → prisma generate → migrate deploy → lint → format:check → typecheck → test
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
