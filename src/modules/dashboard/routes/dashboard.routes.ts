import { Router } from 'express'

import { authenticate } from '../../../shared/http/middlewares/authenticate.js'
import { authorizeRoles } from '../../../shared/http/middlewares/authorize-roles.js'
import { validateRequest } from '../../../shared/http/middlewares/validate-request.js'
import { DashboardController } from '../controllers/DashboardController.js'
import { recentMovementsQuerySchema } from '../dtos/recent-movements-query.dto.js'
import { DashboardService } from '../services/DashboardService.js'

export function createDashboardRoutes(): Router {
  const router = Router()
  const dashboardController = new DashboardController(new DashboardService())

  router.get('/summary', authenticate, authorizeRoles('ADMIN', 'MANAGER'), (req, res, next) =>
    dashboardController.getSummary(req, res, next),
  )

  router.get(
    '/low-stock-products',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER', 'USER'),
    (req, res, next) => dashboardController.getLowStockProducts(req, res, next),
  )

  router.get(
    '/recent-movements',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateRequest(recentMovementsQuerySchema, 'query'),
    (req, res, next) => dashboardController.getRecentMovements(req, res, next),
  )

  return router
}
