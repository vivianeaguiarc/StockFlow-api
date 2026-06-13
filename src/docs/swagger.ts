import type { Express } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import { env } from '../config/env.js'
import { swaggerComponents } from './swagger-components.js'
import { swaggerPaths } from './swagger-paths.js'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'StockFlow API',
    version: '1.0.0',
    description:
      'SaaS multi-tenant inventory management platform. Authenticate via POST /api/v1/auth/login and use the Bearer token for protected routes. Legacy routes under /api remain available temporarily.',
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Local development',
    },
  ],
  tags: [
    { name: 'Health', description: 'Service health checks' },
    { name: 'Auth', description: 'Authentication and registration' },
    { name: 'Current User', description: 'Authenticated user profile' },
    { name: 'Companies', description: 'Company profile management' },
    { name: 'Users', description: 'User management (RBAC)' },
    { name: 'Categories', description: 'Product categories' },
    { name: 'Suppliers', description: 'Supplier management' },
    { name: 'Products', description: 'Product catalog and stock' },
    { name: 'Inventory', description: 'Stock movements (ENTRY, EXIT, ADJUSTMENT)' },
    { name: 'Dashboard', description: 'Company metrics and operational insights' },
    { name: 'Audit', description: 'Audit trail (ADMIN only)' },
  ],
  paths: swaggerPaths,
  components: swaggerComponents,
}

const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
})

export function registerSwagger(app: Express): void {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }))
}
