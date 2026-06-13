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

### Installation

```bash
pnpm install
cp .env.example .env
```

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
