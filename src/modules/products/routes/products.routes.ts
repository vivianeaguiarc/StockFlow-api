import { Router } from 'express'

import { authenticate } from '../../../shared/http/middlewares/authenticate.js'
import { authorizeRoles } from '../../../shared/http/middlewares/authorize-roles.js'
import { validateRequest } from '../../../shared/http/middlewares/validate-request.js'
import { ProductsController } from '../controllers/ProductsController.js'
import { createProductSchema } from '../dtos/create-product.dto.js'
import { listProductsQuerySchema } from '../dtos/list-products-query.dto.js'
import { updateProductSchema } from '../dtos/update-product.dto.js'
import { ProductsService } from '../services/ProductsService.js'

export function createProductsRoutes(): Router {
  const router = Router()
  const productsController = new ProductsController(new ProductsService())

  router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateRequest(createProductSchema),
    (req, res, next) => productsController.create(req, res, next),
  )

  router.get(
    '/',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER', 'USER'),
    validateRequest(listProductsQuerySchema, 'query'),
    (req, res, next) => productsController.list(req, res, next),
  )

  router.get('/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER', 'USER'), (req, res, next) =>
    productsController.getById(req, res, next),
  )

  router.patch(
    '/:id',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateRequest(updateProductSchema),
    (req, res, next) => productsController.update(req, res, next),
  )

  router.delete('/:id', authenticate, authorizeRoles('ADMIN'), (req, res, next) =>
    productsController.delete(req, res, next),
  )

  return router
}
