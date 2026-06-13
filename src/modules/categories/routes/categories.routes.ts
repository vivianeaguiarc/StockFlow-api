import { Router } from 'express'

import { authenticate } from '../../../shared/http/middlewares/authenticate.js'
import { authorizeRoles } from '../../../shared/http/middlewares/authorize-roles.js'
import { validateRequest } from '../../../shared/http/middlewares/validate-request.js'
import { CategoriesController } from '../controllers/CategoriesController.js'
import { createCategorySchema } from '../dtos/create-category.dto.js'
import { listCategoriesQuerySchema } from '../dtos/list-categories-query.dto.js'
import { updateCategorySchema } from '../dtos/update-category.dto.js'
import { CategoriesService } from '../services/CategoriesService.js'

export function createCategoriesRoutes(): Router {
  const router = Router()
  const categoriesController = new CategoriesController(new CategoriesService())

  router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateRequest(createCategorySchema),
    (req, res, next) => categoriesController.create(req, res, next),
  )

  router.get(
    '/',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER', 'EMPLOYEE'),
    validateRequest(listCategoriesQuerySchema, 'query'),
    (req, res, next) => categoriesController.list(req, res, next),
  )

  router.get(
    '/:id',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER', 'EMPLOYEE'),
    (req, res, next) => categoriesController.getById(req, res, next),
  )

  router.patch(
    '/:id',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateRequest(updateCategorySchema),
    (req, res, next) => categoriesController.update(req, res, next),
  )

  router.delete('/:id', authenticate, authorizeRoles('ADMIN'), (req, res, next) =>
    categoriesController.delete(req, res, next),
  )

  return router
}
