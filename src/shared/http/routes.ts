import type { Express, Response } from 'express'
import { Router } from 'express'

import { env } from '../../config/env.js'
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

export function registerRoutes(app: Express): void {
  const apiRouter = Router()

  apiRouter.get('/', (_req, res) => {
    sendSuccess(res, {
      name: 'StockFlow API',
      version: '1.0.0',
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

  app.use('/api', apiRouter)

  const v1Router = Router()

  v1Router.get('/', (_req, res: Response) => {
    sendSuccess(res, {
      name: 'StockFlow API',
      version: '1.0.0',
      apiVersion: 'v1',
      description: 'SaaS multi-tenant inventory management platform',
    })
  })

  app.use(env.API_PREFIX, v1Router)
}
