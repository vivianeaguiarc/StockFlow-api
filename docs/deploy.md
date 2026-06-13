# Deploy em cloud — StockFlow API

Guia para publicar a StockFlow API em plataformas cloud (Render, Railway, Fly.io) ou VPS, usando PostgreSQL e Redis gerenciados.

---

## Visão geral

| Componente     | Obrigatório | Descrição                                                   |
| -------------- | ----------- | ----------------------------------------------------------- |
| **API**        | Sim         | Node.js 22 — build TypeScript + Prisma Client               |
| **PostgreSQL** | Sim         | Banco principal (Prisma ORM)                                |
| **Redis**      | Recomendado | Cache de leitura; API funciona com fallback se indisponível |
| **Migrations** | Sim         | Executar `prisma migrate deploy` antes ou no startup        |

A API expõe:

- Rotas versionadas em `/api/v1`
- Swagger em `/api/docs` (público, sem autenticação)
- Readiness probe em `/api/v1/health/ready`

---

## Pré-requisitos

1. Repositório Git conectado à plataforma (GitHub, GitLab, etc.).
2. Instância **PostgreSQL** provisionada (Render PostgreSQL, Railway Postgres, Supabase, Neon, etc.).
3. Instância **Redis** provisionada (Upstash, Railway Redis, Render Key Value, etc.) — recomendado em produção.
4. `JWT_SECRET` forte gerado localmente (nunca commitar).

---

## Variáveis de ambiente (produção)

Configure todas as variáveis abaixo no painel da plataforma ou via secrets. **Nunca** commite valores reais no repositório.

### Obrigatórias

| Variável       | Exemplo                                             | Descrição                                                                                       |
| -------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `NODE_ENV`     | `production`                                        | Ambiente de execução                                                                            |
| `PORT`         | `3333`                                              | Porta HTTP (plataformas como Render/Railway injetam automaticamente — use a variável fornecida) |
| `HOST`         | `0.0.0.0`                                           | Interface de bind (obrigatório em containers/cloud)                                             |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?schema=public` | Connection string PostgreSQL (Prisma)                                                           |
| `JWT_SECRET`   | _(string longa e aleatória)_                        | Segredo para assinatura de access tokens                                                        |

### Recomendadas

| Variável                        | Exemplo                              | Descrição                                 |
| ------------------------------- | ------------------------------------ | ----------------------------------------- |
| `REDIS_URL`                     | `redis://default:pass@host:6379`     | Connection string Redis                   |
| `JWT_EXPIRES_IN`                | `7d`                                 | Expiração do access token                 |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | `30`                                 | Expiração do refresh token (dias)         |
| `CACHE_TTL_SECONDS`             | `300`                                | TTL padrão do cache Redis                 |
| `CACHE_ENABLED`                 | `true`                               | Habilita cache em produção                |
| `API_PREFIX`                    | `/api/v1`                            | Prefixo das rotas versionadas             |
| `PUBLIC_URL`                    | `https://stockflow-api.onrender.com` | URL pública da API (Swagger "Try it out") |

### Opcionais (rate limiting)

| Variável                      | Default  | Descrição                           |
| ----------------------------- | -------- | ----------------------------------- |
| `RATE_LIMIT_ENABLED`          | `true`   | Habilita rate limiting              |
| `RATE_LIMIT_GLOBAL_MAX`       | `100`    | Máx. requisições globais por janela |
| `RATE_LIMIT_GLOBAL_WINDOW_MS` | `900000` | Janela global (15 min)              |
| `RATE_LIMIT_LOGIN_MAX`        | `5`      | Máx. tentativas de login por IP     |
| `RATE_LIMIT_REGISTER_MAX`     | `10`     | Máx. registros por IP               |

### Exemplo `.env` de produção (referência — não commitar)

```env
NODE_ENV=production
PORT=3333
HOST=0.0.0.0
API_PREFIX=/api/v1
PUBLIC_URL=https://stockflow-api.onrender.com

DATABASE_URL=postgresql://user:password@db-host:5432/stockflow_db?schema=public

REDIS_URL=redis://default:password@redis-host:6379
CACHE_ENABLED=true
CACHE_TTL_SECONDS=300

JWT_SECRET=replace-with-a-long-random-secret-min-32-chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN_DAYS=30

RATE_LIMIT_ENABLED=true
```

> **Nota:** o nome correto da variável de refresh token é `REFRESH_TOKEN_EXPIRES_IN_DAYS` (não `REFRESH_TOKEN_EXPIRES_IN`).

---

## Build

Comandos usados localmente e em plataformas PaaS:

```bash
# Instalar dependências
pnpm install --frozen-lockfile

# Gerar Prisma Client
pnpm db:generate

# Compilar TypeScript → dist/
pnpm build
```

Equivalente em uma linha (CI/PaaS):

```bash
pnpm install --frozen-lockfile && pnpm db:generate && pnpm build
```

---

## Start

Após o build, inicie a API:

```bash
node dist/server.js
```

**Recomendado em produção** — aplicar migrations antes de aceitar tráfego:

```bash
pnpm prisma migrate deploy && node dist/server.js
```

O `docker-entrypoint.sh` do projeto já executa `prisma migrate deploy` automaticamente quando a imagem Docker é usada.

---

## Migrations em produção

| Ambiente               | Comando                      | Quando                                   |
| ---------------------- | ---------------------------- | ---------------------------------------- |
| **Produção / staging** | `pnpm prisma migrate deploy` | Antes do start ou no entrypoint          |
| **Desenvolvimento**    | `pnpm db:migrate`            | Cria e aplica migrations interativamente |

### Boas práticas

1. **Nunca** use `prisma migrate dev` em produção.
2. Migrations devem estar versionadas em `prisma/migrations/` no repositório.
3. Faça backup do banco antes de deploys com schema changes (ver `pnpm db:backup`).
4. Em PaaS, configure o **release command** ou **pre-deploy hook** para rodar migrations.
5. Se a migration falhar, a API **não** deve receber tráfego até o problema ser resolvido.

### Verificar migrations aplicadas

```bash
pnpm prisma migrate status
```

---

## Health check

Use o endpoint de **readiness** para load balancers, orchestrators e health checks da plataforma:

```http
GET /api/v1/health/ready
```

| Resposta                                                             | HTTP  | Significado                                  |
| -------------------------------------------------------------------- | ----- | -------------------------------------------- |
| `{ "status": "ready", "services": { "database": "up", ... } }`       | `200` | PostgreSQL disponível — pode receber tráfego |
| `{ "status": "not_ready", "services": { "database": "down", ... } }` | `503` | PostgreSQL indisponível — remover do pool    |

### Outros endpoints

| Endpoint                     | Uso                                     |
| ---------------------------- | --------------------------------------- |
| `GET /api/v1/health/live`    | Liveness — processo Node está vivo      |
| `GET /api/v1/health/details` | Diagnóstico (versão, uptime, Redis, DB) |
| `GET /api/v1/health`         | Compatibilidade — status básico         |

### Configuração por plataforma

| Plataforma         | Campo                      | Valor                                                 |
| ------------------ | -------------------------- | ----------------------------------------------------- |
| **Render**         | Health Check Path          | `/api/v1/health/ready`                                |
| **Railway**        | Healthcheck Path           | `/api/v1/health/ready`                                |
| **Fly.io**         | `http_service.checks.path` | `/api/v1/health/ready`                                |
| **Docker Compose** | `healthcheck.test`         | `wget -qO- http://localhost:3333/api/v1/health/ready` |

---

## Swagger em produção

A documentação interativa fica disponível em:

```text
https://<seu-dominio>/api/docs
```

- **Não exige autenticação** — adequado para documentação pública da API.
- **Rate limiting** não se aplica a `/api/docs`.
- Configure `PUBLIC_URL` com a URL pública (ex.: `https://stockflow-api.onrender.com`) para que o botão **Try it out** do Swagger aponte para o servidor correto.

---

## Checklist de deploy

Use esta lista antes de cada deploy em produção:

- [ ] Código mergeado na branch principal e CI verde (lint, typecheck, testes).
- [ ] `DATABASE_URL` apontando para o PostgreSQL de produção.
- [ ] `REDIS_URL` configurado (ou `CACHE_ENABLED=false` conscientemente).
- [ ] `JWT_SECRET` único, longo e armazenado como secret da plataforma.
- [ ] `NODE_ENV=production` definido.
- [ ] `HOST=0.0.0.0` (ou default do projeto).
- [ ] `PUBLIC_URL` configurado com a URL pública da API.
- [ ] `pnpm prisma migrate deploy` executado com sucesso.
- [ ] Health check configurado em `/api/v1/health/ready`.
- [ ] Swagger acessível em `/api/docs`.
- [ ] Smoke test: `GET /api/v1/health/live` → 200.
- [ ] Smoke test: `GET /api/v1/health/ready` → 200.
- [ ] Smoke test: `POST /api/v1/auth/login` com credenciais válidas.
- [ ] Logs da aplicação visíveis no painel da plataforma.
- [ ] Backup recente do banco (se aplicável).

---

## Checklist de segurança (pré-deploy)

- [ ] `JWT_SECRET` **não** é o valor de `.env.example` nem foi commitado.
- [ ] Credenciais de banco (`DATABASE_URL`) são secrets da plataforma.
- [ ] `REDIS_URL` com senha forte (se exposto na internet).
- [ ] HTTPS habilitado (TLS terminado na plataforma ou reverse proxy).
- [ ] Rate limiting habilitado (`RATE_LIMIT_ENABLED=true`).
- [ ] Seed de desenvolvimento (`pnpm db:seed`) **não** executado em produção.
- [ ] Portas de PostgreSQL/Redis **não** expostas publicamente (apenas rede interna).
- [ ] Variáveis sensíveis ausentes de logs e do repositório Git.
- [ ] CORS revisado se frontends específicos forem adicionados no futuro.
- [ ] Revisão de permissões RBAC e rotas admin antes de abrir acesso público.

---

## Exemplo: Render

### Web Service (API)

| Campo                 | Valor                                                              |
| --------------------- | ------------------------------------------------------------------ |
| **Runtime**           | Node                                                               |
| **Build Command**     | `pnpm install --frozen-lockfile && pnpm db:generate && pnpm build` |
| **Start Command**     | `pnpm prisma migrate deploy && node dist/server.js`                |
| **Health Check Path** | `/api/v1/health/ready`                                             |

### Environment Variables

```env
NODE_ENV=production
HOST=0.0.0.0
API_PREFIX=/api/v1
PUBLIC_URL=https://stockflow-api.onrender.com
DATABASE_URL=<Internal Database URL do Render PostgreSQL>
REDIS_URL=<URL do Redis externo, ex.: Upstash>
JWT_SECRET=<secret-gerado>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN_DAYS=30
CACHE_ENABLED=true
CACHE_TTL_SECONDS=300
```

### PostgreSQL no Render

1. Crie um **PostgreSQL** no mesmo dashboard.
2. Copie a **Internal Database URL** para `DATABASE_URL` do Web Service.
3. Garanta que API e banco estejam na mesma região.

### Redis no Render

Render não inclui Redis nativo no plano free. Opções:

- [Upstash Redis](https://upstash.com/) (serverless, free tier)
- Redis addon de terceiros

---

## Exemplo: Railway

### Service (API)

| Campo                | Valor                                                              |
| -------------------- | ------------------------------------------------------------------ |
| **Build Command**    | `pnpm install --frozen-lockfile && pnpm db:generate && pnpm build` |
| **Start Command**    | `pnpm prisma migrate deploy && node dist/server.js`                |
| **Healthcheck Path** | `/api/v1/health/ready`                                             |

### Plugins recomendados

1. **PostgreSQL** — Railway injeta `DATABASE_URL` automaticamente.
2. **Redis** — Railway injeta `REDIS_URL` automaticamente.

### Variables (referência)

```env
NODE_ENV=production
HOST=0.0.0.0
PUBLIC_URL=https://stockflow-api-production.up.railway.app
JWT_SECRET=<secret-gerado>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN_DAYS=30
CACHE_ENABLED=true
CACHE_TTL_SECONDS=300
```

> Railway define `PORT` automaticamente — **não** sobrescreva unless necessário.

---

## Exemplo: Fly.io (resumo)

```toml
# fly.toml (trecho)
[http_service]
  internal_port = 3333
  force_https = true

  [[http_service.checks]]
    path = "/api/v1/health/ready"
    interval = "15s"
    timeout = "5s"
```

Deploy com Dockerfile existente:

```bash
fly launch
fly secrets set DATABASE_URL="..." REDIS_URL="..." JWT_SECRET="..."
fly deploy
```

---

## Exemplo: VPS / Docker Compose

Para VPS (DigitalOcean, Hetzner, AWS EC2), use o `Dockerfile` e `docker-compose.yml` do projeto:

```bash
# Na VPS
git clone <repo>
cd stockflow-api
cp .env.example .env
# Edite .env com valores de produção

docker compose up --build -d
```

O container da API:

- Executa `prisma migrate deploy` no startup (`docker-entrypoint.sh`).
- Health check interno em `/api/v1/health/ready`.
- Expõe porta `3333`.

Coloque **Nginx** ou **Caddy** na frente para TLS:

```nginx
location / {
    proxy_pass http://127.0.0.1:3333;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## CI/CD (GitHub Actions)

O pipeline existente (`.github/workflows/ci.yml`) valida qualidade antes do deploy:

```text
pnpm install → prisma generate → migrate deploy → lint → format → typecheck → test
```

O deploy em si é feito pela plataforma cloud (auto-deploy on push) ou manualmente via CLI/Docker.

---

## Troubleshooting

| Problema                      | Causa provável                      | Solução                                            |
| ----------------------------- | ----------------------------------- | -------------------------------------------------- |
| API não responde externamente | Bind em `127.0.0.1`                 | Defina `HOST=0.0.0.0`                              |
| Health check falha            | PostgreSQL indisponível             | Verifique `DATABASE_URL` e conectividade           |
| Swagger "Try it out" errado   | `PUBLIC_URL` ausente                | Configure URL pública completa                     |
| `P1001` Prisma                | Banco inacessível                   | Firewall, SSL (`?sslmode=require`), URL incorreta  |
| Migrations pendentes          | Deploy sem migrate                  | Adicione `prisma migrate deploy` ao start/release  |
| Cache não funciona            | Redis down ou `CACHE_ENABLED=false` | Verifique `REDIS_URL`; API continua via PostgreSQL |

---

## Referências

- [README](../README.md) — desenvolvimento local
- [Prisma Deploy](https://www.prisma.io/docs/orm/prisma-migrate/workflows/deploying-database-changes)
- [Render Node deploy](https://render.com/docs/deploy-node-express-app)
- [Railway deploy guide](https://docs.railway.com/guides/nodejs)
