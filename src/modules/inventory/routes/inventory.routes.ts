import { Router } from 'express'

import { authenticate } from '../../../shared/http/middlewares/authenticate.js'
import { authorizeRoles } from '../../../shared/http/middlewares/authorize-roles.js'
import { validateRequest } from '../../../shared/http/middlewares/validate-request.js'
import { paginationSchema } from '../../../shared/utils/pagination.js'
import { InventoryController } from '../controllers/InventoryController.js'
import { createMovementSchema } from '../dtos/create-movement.dto.js'
import { InventoryService } from '../services/InventoryService.js'

export function createInventoryRoutes(): Router {
  const router = Router()
  const inventoryController = new InventoryController(new InventoryService())

  router.post(
    '/movements',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER', 'EMPLOYEE'),
    validateRequest(createMovementSchema),
    (req, res, next) => inventoryController.createMovement(req, res, next),
  )

  router.get(
    '/movements',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateRequest(paginationSchema, 'query'),
    (req, res, next) => inventoryController.listMovements(req, res, next),
  )

  router.get('/movements/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER'), (req, res, next) =>
    inventoryController.getMovementById(req, res, next),
  )

  return router
}
