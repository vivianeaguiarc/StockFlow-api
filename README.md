# StockFlow API

SaaS multi-tenant inventory management platform built with Node.js, TypeScript, and Express.

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript (strict mode)
- **Framework:** Express 5
- **Validation:** Zod
- **Package Manager:** pnpm

## Architecture

```
src/
├── modules/          # Feature modules (auth, products, inventory, etc.)
├── shared/           # Cross-cutting concerns (errors, middlewares, utils)
├── config/           # Environment and app configuration
├── docs/             # API documentation (Swagger — future)
├── app.ts            # Express app factory
├── routes.ts         # Route registration
└── server.ts         # Entry point
```

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 11
- Docker and Docker Compose

### Installation

```bash
pnpm install
cp .env.example .env
```

### Database (PostgreSQL)

Start the local PostgreSQL container:

```bash
pnpm db:up
```

Other useful commands:

```bash
pnpm db:logs    # follow container logs
pnpm db:down    # stop the container (data is preserved in the volume)
```

Connection details:

| Variable       | Value              |
| -------------- | ------------------ |
| Host           | `localhost`        |
| Port           | `5432`             |
| User           | `stockflow`        |
| Password       | `stockflow`        |
| Database       | `stockflow_db`     |
| `DATABASE_URL` | see `.env.example` |

Data is persisted in the Docker volume `stockflow_postgres_data`.

### Prisma ORM

```bash
pnpm db:generate   # generate Prisma Client after schema changes
pnpm db:migrate    # create and apply migrations (dev)
pnpm db:push       # push schema without migration (prototyping)
pnpm db:studio     # open Prisma Studio GUI
```

Schema location: `prisma/schema.prisma`

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
pnpm start
```

### Quality

```bash
pnpm typecheck
pnpm lint
pnpm format:check
```

## API Endpoints

| Method | Path      | Description  |
| ------ | --------- | ------------ |
| GET    | `/health` | Health check |
| GET    | `/api/v1` | API info     |

## License

ISC
