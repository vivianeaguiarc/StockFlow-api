# Deploy no Render — StockFlow API

Passo a passo para publicar e manter a StockFlow API no [Render](https://render.com) com **PostgreSQL** e **Redis** gerenciados.

**Produção atual:** [https://stockflow-api-l4x4.onrender.com](https://stockflow-api-l4x4.onrender.com) · [Swagger](https://stockflow-api-l4x4.onrender.com/api/docs)

> Guia genérico de cloud: [`deploy.md`](deploy.md) · Blueprint: [`render.yaml`](../render.yaml)

---

## Visão geral

| Recurso Render                       | Uso                          |
| ------------------------------------ | ---------------------------- |
| **Web Service**                      | API Node.js (StockFlow)      |
| **PostgreSQL**                       | Banco principal (Prisma ORM) |
| **Key Value (Redis)** ou **Upstash** | Cache Redis                  |

---

## Pré-requisitos

- Conta no [Render](https://render.com)
- Repositório Git (GitHub/GitLab) com o código da StockFlow API
- `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` gerados localmente (ex.: `openssl rand -base64 48`) — **nunca** commitar

---

## Passo 1 — Criar PostgreSQL no Render

1. No dashboard Render: **New +** → **PostgreSQL**
2. Nome: `stockflow-db` (ou similar)
3. Região: mesma região do Web Service (ex.: Oregon)
4. Plano: Free ou paid conforme necessidade
5. Após criado, copie a **Internal Database URL** (uso entre serviços Render na mesma região)

Formato esperado em `DATABASE_URL`:

```text
postgresql://user:password@dpg-xxxxx-a/stockflow_db
```

> Use a **Internal URL** no Web Service. A External URL só é necessária para acesso fora da rede Render.

---

## Passo 2 — Criar Redis

Render oferece **Key Value** (compatível com Redis). Alternativa: [Upstash Redis](https://upstash.com/) (free tier).

### Opção A — Render Key Value

1. **New +** → **Key Value**
2. Mesma região do Web Service
3. Copie a **Internal Redis URL** → use em `REDIS_URL`

### Opção B — Upstash (externo)

1. Crie database Redis no Upstash
2. Copie a URL `rediss://...` ou `redis://...`
3. Configure como `REDIS_URL` no Web Service

> Sem Redis, a API continua funcionando (fallback para PostgreSQL), mas cache e performance degradam.

---

## Passo 3 — Criar Web Service (API)

1. **New +** → **Web Service**
2. Conecte o repositório Git da StockFlow API
3. Configurações:

| Campo                  | Valor                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| **Name**               | `stockflow-api`                                                    |
| **Region**             | Mesma do PostgreSQL/Redis                                          |
| **Runtime**            | Node                                                               |
| **Branch**             | `main`                                                             |
| **Build Command**      | `pnpm install --frozen-lockfile && pnpm db:generate && pnpm build` |
| **Pre-Deploy Command** | `pnpm db:migrate:deploy`                                           |
| **Start Command**      | `pnpm start`                                                       |
| **Health Check Path**  | `/api/v1/health`                                                   |

### Auto-Deploy

Deixe **Auto-Deploy** habilitado para deploy automático a cada push na branch `main`.

---

## Passo 4 — Variáveis de ambiente

No Web Service → **Environment** → adicione:

| Variável                        | Valor                                         | Obrigatório                        |
| ------------------------------- | --------------------------------------------- | ---------------------------------- |
| `NODE_ENV`                      | `production`                                  | Sim                                |
| `HOST`                          | `0.0.0.0`                                     | Sim                                |
| `HUSKY`                         | `0`                                           | Sim (evita erro do Husky no build) |
| `TRUST_PROXY`                   | `true`                                        | Sim (IP real no Render)            |
| `DATABASE_URL`                  | Internal Database URL do PostgreSQL           | Sim                                |
| `JWT_ACCESS_SECRET`             | Secret longo e aleatório (access token)       | Sim                                |
| `JWT_REFRESH_SECRET`            | Secret longo e aleatório (refresh token hash) | Sim                                |
| `REDIS_URL`                     | URL do Key Value ou Upstash                   | Sim se `CACHE_ENABLED=true`        |
| `RATE_LIMIT_ENABLED`            | `true`                                        | Sim                                |
| `CORS_ORIGINS` ou `CORS_ORIGIN` | Origins do frontend                           | Recomendado                        |
| `JWT_EXPIRES_IN`                | `15m`                                         | Recomendado                        |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | `7`                                           | Recomendado                        |
| `CACHE_TTL_SECONDS`             | `300`                                         | Recomendado                        |
| `CACHE_ENABLED`                 | `true`                                        | Recomendado                        |
| `API_PREFIX`                    | `/api/v1`                                     | Opcional                           |
| `PUBLIC_URL`                    | `https://stockflow-api-l4x4.onrender.com`     | Recomendado (Swagger)              |

> **Não defina `PORT` manualmente** — o Render injeta `PORT` automaticamente. A API lê `process.env.PORT` via `config/env.ts`.

> **Nunca** commite `.env` com valores reais. Use apenas secrets do painel Render.

### Exemplo (placeholders — substitua pelos seus valores)

```env
NODE_ENV=production
HOST=0.0.0.0
HUSKY=0
API_PREFIX=/api/v1
PUBLIC_URL=https://stockflow-api-l4x4.onrender.com
TRUST_PROXY=true
RATE_LIMIT_ENABLED=true

DATABASE_URL=postgresql://user:password@dpg-xxxxx-a/stockflow_db
REDIS_URL=redis://red-xxxxx:6379

JWT_ACCESS_SECRET=replace-with-long-random-secret-min-32-chars
JWT_REFRESH_SECRET=replace-with-another-long-random-secret-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=7
CORS_ORIGINS=https://your-frontend.example.com
CACHE_ENABLED=true
CACHE_TTL_SECONDS=300
```

---

## Passo 5 — Scripts do projeto

Scripts usados pelo Render (já configurados em `package.json`):

| Script              | Comando                 | Quando                           |
| ------------------- | ----------------------- | -------------------------------- |
| `build`             | `tsc`                   | Build Command (via `pnpm build`) |
| `start`             | `node dist/server.js`   | Start Command (via `pnpm start`) |
| `db:generate`       | `prisma generate`       | Build Command                    |
| `db:migrate:deploy` | `prisma migrate deploy` | Pre-Deploy Command               |

Fluxo no Render:

```text
pnpm install → pnpm db:generate → pnpm build → pnpm db:migrate:deploy → pnpm start
```

---

## Passo 6 — Deploy e verificação

1. Clique **Create Web Service** (ou faça push na branch conectada)
2. Acompanhe os logs do **Build** e **Pre-Deploy**
3. Após **Live**, execute smoke tests:

```bash
export API_URL=https://stockflow-api-l4x4.onrender.com

curl -i "$API_URL/api/v1/health"
curl -i "$API_URL/api/v1/ready"
curl "$API_URL/api/v1/health/details"
```

Resultados esperados:

| Endpoint         | HTTP | Body                                                           |
| ---------------- | ---- | -------------------------------------------------------------- |
| `/api/v1/health` | 200  | `{ "status": "ok", ... }` (health check do Render)             |
| `/api/v1/ready`  | 200  | `{ "status": "ready", "services": { "database": "up", ... } }` |
| `/api/docs`      | 200  | Swagger UI                                                     |

4. Registre a primeira empresa:

```bash
curl -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "company": {
      "name": "Demo Corp",
      "document": "12345678000199",
      "email": "contact@demo.com"
    },
    "user": {
      "name": "Admin",
      "email": "admin@demo.com",
      "password": "Admin@123456"
    }
  }'
```

> **Não** execute `pnpm db:seed` em produção — use registro via API ou dados controlados.

---

## Configuração resumida (copiar/colar)

```yaml
# Render Web Service
Build Command: pnpm install --frozen-lockfile && pnpm db:generate && pnpm build
Pre-Deploy Command: pnpm db:migrate:deploy
Start Command: pnpm start
Health Check Path: /api/v1/health
```

---

## Prisma e DATABASE_URL

O Prisma lê `DATABASE_URL` de `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

No Render, vincule a Internal Database URL do PostgreSQL à variável `DATABASE_URL` do Web Service. O **Pre-Deploy Command** aplica migrations pendentes antes de cada deploy.

---

## Swagger em produção

Acesse:

```text
https://<seu-servico>.onrender.com/api/docs
```

Configure `PUBLIC_URL` com a URL pública (sem barra final) para o **Try it out** funcionar corretamente.

---

## Checklist pós-deploy

- [ ] Build concluiu sem erros
- [ ] Pre-Deploy (`db:migrate:deploy`) aplicou migrations
- [ ] Health check `/api/v1/health` retorna 200
- [ ] Readiness `/api/v1/ready` retorna 200 (PostgreSQL up)
- [ ] Swagger acessível em `/api/docs`
- [ ] `JWT_SECRET` não é o valor de `.env.example`
- [ ] PostgreSQL usa Internal URL
- [ ] Redis conectado (verificar `/api/v1/health/details`)
- [ ] Registro/login funcionando

---

## Troubleshooting

| Problema                                           | Solução                                                                                                                                                                                                                |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build falha no `prepare` / Husky                   | Defina `HUSKY=0`                                                                                                                                                                                                       |
| `P1001: Can't reach database`                      | Use Internal Database URL; mesmo region                                                                                                                                                                                |
| Pre-Deploy migration falha                         | Verifique logs; rode `pnpm prisma migrate status` localmente                                                                                                                                                           |
| Health check 503                                   | PostgreSQL indisponível ou `DATABASE_URL` incorreto                                                                                                                                                                    |
| API não responde                                   | Confirme `HOST=0.0.0.0`                                                                                                                                                                                                |
| Swagger Try it out errado                          | Configure `PUBLIC_URL`                                                                                                                                                                                                 |
| Redis down em `/details`                           | Verifique `REDIS_URL`; API continua sem cache                                                                                                                                                                          |
| Plano free “dorme”                                 | Primeira requisição pode demorar ~30s (cold start)                                                                                                                                                                     |
| `tsx watch src/server.ts` / `ERR_MODULE_NOT_FOUND` | **Runtime Docker:** o `Dockerfile` deve terminar no stage **production** (`node dist/server.js`). **Não** use `pnpm dev` como Start/Docker Command. **Runtime Node:** use Start Command `pnpm start` (não `pnpm dev`). |
| No open ports detected                             | App não subiu — confira Start Command e logs acima                                                                                                                                                                     |

### Runtime Node vs Docker no Render

| Configuração           | Recomendado                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| **Runtime**            | **Node** (nativo)                                                  |
| **Build Command**      | `pnpm install --frozen-lockfile && pnpm db:generate && pnpm build` |
| **Pre-Deploy Command** | `pnpm db:migrate:deploy`                                           |
| **Start Command**      | `pnpm start`                                                       |

Se usar **Docker** no Render:

- **Dockerfile:** `./Dockerfile` (stage padrão = produção)
- **Docker Command:** deixe vazio (usa `CMD ["node", "dist/server.js"]`) ou `node dist/server.js`
- **Nunca** `pnpm dev` em produção — a imagem não inclui `src/`, apenas `dist/`

---

## Referências

- [Render — Deploy Node.js](https://render.com/docs/deploy-node-express-app)
- [Render — PostgreSQL](https://render.com/docs/postgresql)
- [Render — Key Value (Redis)](https://render.com/docs/key-value)
- [Prisma — Deploy migrations](https://www.prisma.io/docs/orm/prisma-migrate/workflows/deploying-database-changes)
- [StockFlow — deploy genérico](deploy.md)
