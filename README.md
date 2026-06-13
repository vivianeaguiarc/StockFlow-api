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

| Módulo         | Descrição                                            |
| -------------- | ---------------------------------------------------- |
| **Auth**       | Registro de empresa + admin, login com JWT           |
| **Companies**  | Perfil da empresa autenticada                        |
| **Users**      | CRUD de usuários com RBAC (ADMIN, MANAGER, EMPLOYEE) |
| **Categories** | CRUD de categorias de produtos                       |
| **Suppliers**  | CRUD de fornecedores                                 |
| **Products**   | CRUD de produtos com SKU, preços e estoque           |
| **Inventory**  | Movimentações ENTRY, EXIT e ADJUSTMENT com transação |
| **Audit**      | Trilha de auditoria imutável (somente ADMIN)         |
| **Health**     | Health check da aplicação                            |
| **Swagger**    | Documentação interativa em `/api/docs`               |

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
    ├── types/
    └── utils/             # Paginação, helpers
```

**Fluxo de uma requisição:**

```
HTTP Request
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
curl http://localhost:3333/api/health
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

1. Faça login em `POST /api/auth/login`.
2. Copie o `accessToken` da resposta.
3. Clique em **Authorize** e cole o token (sem o prefixo `Bearer`).

---

## Variáveis de ambiente

| Variável            | Descrição                    | Exemplo                   |
| ------------------- | ---------------------------- | ------------------------- |
| `NODE_ENV`          | Ambiente                     | `development`             |
| `PORT`              | Porta HTTP                   | `3333`                    |
| `API_PREFIX`        | Prefixo versionado           | `/api/v1`                 |
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

---

## Principais rotas

### Públicas

| Método | Rota                 | Descrição                 |
| ------ | -------------------- | ------------------------- |
| GET    | `/api/health`        | Health check              |
| GET    | `/api/docs`          | Swagger UI                |
| POST   | `/api/auth/register` | Registrar empresa + admin |
| POST   | `/api/auth/login`    | Login (retorna JWT)       |

### Autenticadas

| Método | Rota                       | RBAC                         | Descrição                  |
| ------ | -------------------------- | ---------------------------- | -------------------------- |
| GET    | `/api/me`                  | Todos                        | Usuário autenticado        |
| GET    | `/api/companies/me`        | Todos                        | Perfil da empresa          |
| PATCH  | `/api/companies/me`        | ADMIN                        | Atualizar empresa          |
| CRUD   | `/api/users`               | ADMIN / MANAGER              | Gestão de usuários         |
| CRUD   | `/api/categories`          | ADMIN / MANAGER / EMPLOYEE\* | Categorias                 |
| CRUD   | `/api/suppliers`           | ADMIN / MANAGER / EMPLOYEE\* | Fornecedores               |
| CRUD   | `/api/products`            | ADMIN / MANAGER / EMPLOYEE\* | Produtos                   |
| POST   | `/api/inventory/movements` | ADMIN / MANAGER / EMPLOYEE   | Movimentar estoque         |
| GET    | `/api/inventory/movements` | ADMIN / MANAGER              | Histórico de movimentações |
| GET    | `/api/audit/logs`          | ADMIN                        | Logs de auditoria          |

\* EMPLOYEE: somente leitura (GET).

### Exemplo — Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@stockflow.com",
  "password": "Admin@123456"
}
```

### Exemplo — Movimentação de estoque

```http
POST /api/inventory/movements
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
