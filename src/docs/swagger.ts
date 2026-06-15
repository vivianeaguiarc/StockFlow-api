import type { Express, Request, Response } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import { env } from '../config/env.js'
import { swaggerComponents } from './swagger-components.js'
import { swaggerPaths } from './swagger-paths.js'

const PRODUCTION_SERVER_URL = 'https://stockflow-api-l4x4.onrender.com'

function buildSwaggerServers() {
  const servers = [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Local development',
    },
  ]

  if (env.PUBLIC_URL) {
    servers.push({
      url: env.PUBLIC_URL,
      description: 'Production',
    })
  } else if (env.NODE_ENV !== 'test') {
    servers.push({
      url: PRODUCTION_SERVER_URL,
      description: 'Production (Render)',
    })
  }

  return servers
}

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'StockFlow API',
    version: '1.0.0',
    description: [
      'REST API for **StockFlow** — multi-tenant SaaS platform for user management, authentication,',
      'role-based access control (RBAC), audit trails, and inventory operations.',
      '',
      '**Getting started**',
      '1. Register a company via `POST /api/v1/auth/register` or use seeded credentials.',
      '2. Authenticate with `POST /api/v1/auth/login` to obtain JWT access and refresh tokens.',
      '3. Send `Authorization: Bearer <accessToken>` on protected routes.',
      '4. Refresh tokens with `POST /api/v1/auth/refresh` before access token expiry.',
      '',
      '**Security notes**',
      '- Responses never include `password`, `passwordHash`, or stored refresh token hashes.',
      "- All write operations are scoped to the authenticated user's company (tenant isolation).",
      '- Optional `X-Request-ID` header is echoed in responses for request tracing.',
      '',
      '**Interactive docs:** `/api/docs` · **OpenAPI JSON:** `/api/docs/openapi.json`',
    ].join('\n'),
    contact: {
      name: 'StockFlow API',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: buildSwaggerServers(),
  tags: [
    {
      name: 'Auth',
      description:
        'Authentication, registration, JWT access/refresh tokens, logout, and current user profile (`/auth/me`).',
    },
    {
      name: 'Users',
      description:
        'User CRUD with RBAC (ADMIN / MANAGER / USER), pagination, filters (name, email, role), and soft delete.',
    },
    {
      name: 'Health',
      description:
        'Liveness and readiness probes for load balancers, Kubernetes, and observability (PostgreSQL + Redis status).',
    },
    {
      name: 'Audit',
      description:
        'Read-only audit trail for company administrators. Never exposes passwords or tokens.',
    },
    { name: 'Root', description: 'API root and discovery links.' },
    {
      name: 'Current User',
      description: 'JWT claims from the access token (lightweight `/me` endpoint).',
    },
    { name: 'Companies', description: 'Company profile management.' },
    { name: 'Categories', description: 'Product categories.' },
    { name: 'Suppliers', description: 'Supplier management.' },
    { name: 'Products', description: 'Product catalog and stock (Redis-cached listings).' },
    { name: 'Inventory', description: 'Stock movements (ENTRY, EXIT, ADJUSTMENT).' },
    { name: 'Dashboard', description: 'Company metrics and operational insights (Redis-cached).' },
  ],
  paths: swaggerPaths,
  components: swaggerComponents,
}

const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
})

export function getSwaggerSpec(): typeof swaggerSpec {
  return swaggerSpec
}

export function registerSwagger(app: Express): void {
  app.get('/api/docs/openapi.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.json(swaggerSpec)
  })

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'StockFlow API — Swagger',
    }),
  )
}
