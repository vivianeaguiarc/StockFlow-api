import type { Express, Router } from 'express'
import { Router as createRouter } from 'express'

import { createAuditRoutes } from '../../modules/audit/routes/audit.routes.js'
import {
  createAdminOnlyRouteHandlers,
  createAuthRoutes,
  createManagementRouteHandlers,
  createMeRouteHandlers,
} from '../../modules/auth/routes/auth.routes.js'
import { createCategoriesRoutes } from '../../modules/categories/routes/categories.routes.js'
import { createCompaniesRoutes } from '../../modules/companies/routes/companies.routes.js'
import { createDashboardRoutes } from '../../modules/dashboard/routes/dashboard.routes.js'
import { createHealthRoutes } from '../../modules/health/routes/health.routes.js'
import { createInventoryRoutes } from '../../modules/inventory/routes/inventory.routes.js'
import { createProductsRoutes } from '../../modules/products/routes/products.routes.js'
import { createSuppliersRoutes } from '../../modules/suppliers/routes/suppliers.routes.js'
import { createUsersRoutes } from '../../modules/users/routes/users.routes.js'
import { sendSuccess } from './response.js'

const LEGACY_API_PREFIX = '/api'

export function createVersionedApiRouter(): Router {
  const apiRouter = createRouter()

  apiRouter.get('/', (_req, res) => {
    sendSuccess(res, {
      name: 'StockFlow API',
      version: '1.0.0',
      apiVersion: 'v1',
      description: 'SaaS multi-tenant inventory management platform',
    })
  })

  apiRouter.use('/health', createHealthRoutes())
  apiRouter.use('/auth', createAuthRoutes())
  apiRouter.use('/companies', createCompaniesRoutes())
  apiRouter.use('/users', createUsersRoutes())
  apiRouter.use('/categories', createCategoriesRoutes())
  apiRouter.use('/suppliers', createSuppliersRoutes())
  apiRouter.use('/products', createProductsRoutes())
  apiRouter.use('/inventory', createInventoryRoutes())
  apiRouter.use('/dashboard', createDashboardRoutes())
  apiRouter.use('/audit', createAuditRoutes())
  apiRouter.get('/me', ...createMeRouteHandlers())
  apiRouter.get('/admin-only', ...createAdminOnlyRouteHandlers())
  apiRouter.get('/management', ...createManagementRouteHandlers())

  return apiRouter
}

export function mountVersionedApiRoutes(app: Express, apiRouter: Router, apiPrefix: string): void {
  app.use(apiPrefix, apiRouter)

  if (apiPrefix !== LEGACY_API_PREFIX) {
    app.use(LEGACY_API_PREFIX, apiRouter)
  }
}
