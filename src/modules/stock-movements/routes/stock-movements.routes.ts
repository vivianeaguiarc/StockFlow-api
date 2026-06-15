import { Router } from 'express'

import { authenticate } from '../../../shared/http/middlewares/authenticate.js'
import { authorizeRoles } from '../../../shared/http/middlewares/authorize-roles.js'
import { validateRequest } from '../../../shared/http/middlewares/validate-request.js'
import { StockMovementsController } from '../../products/stock-movements/controllers/StockMovementsController.js'
import { listStockMovementsQuerySchema } from '../../products/stock-movements/dtos/list-stock-movements-query.dto.js'
import { StockMovementsService } from '../../products/stock-movements/services/StockMovementsService.js'

export function createStockMovementsRoutes(): Router {
  const router = Router()
  const stockMovementsController = new StockMovementsController(new StockMovementsService())

  router.get(
    '/',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER', 'USER'),
    validateRequest(listStockMovementsQuerySchema, 'query'),
    (req, res, next) => stockMovementsController.list(req, res, next),
  )

  return router
}
