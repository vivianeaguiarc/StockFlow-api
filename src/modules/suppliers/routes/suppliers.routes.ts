import { Router } from 'express'

import { authenticate } from '../../../shared/http/middlewares/authenticate.js'
import { authorizeRoles } from '../../../shared/http/middlewares/authorize-roles.js'
import { validateRequest } from '../../../shared/http/middlewares/validate-request.js'
import { SuppliersController } from '../controllers/SuppliersController.js'
import { createSupplierSchema } from '../dtos/create-supplier.dto.js'
import { listSuppliersQuerySchema } from '../dtos/list-suppliers-query.dto.js'
import { updateSupplierSchema } from '../dtos/update-supplier.dto.js'
import { SuppliersService } from '../services/SuppliersService.js'

export function createSuppliersRoutes(): Router {
  const router = Router()
  const suppliersController = new SuppliersController(new SuppliersService())

  router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateRequest(createSupplierSchema),
    (req, res, next) => suppliersController.create(req, res, next),
  )

  router.get(
    '/',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER', 'USER'),
    validateRequest(listSuppliersQuerySchema, 'query'),
    (req, res, next) => suppliersController.list(req, res, next),
  )

  router.get('/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER', 'USER'), (req, res, next) =>
    suppliersController.getById(req, res, next),
  )

  router.patch(
    '/:id',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateRequest(updateSupplierSchema),
    (req, res, next) => suppliersController.update(req, res, next),
  )

  router.delete('/:id', authenticate, authorizeRoles('ADMIN'), (req, res, next) =>
    suppliersController.delete(req, res, next),
  )

  return router
}
