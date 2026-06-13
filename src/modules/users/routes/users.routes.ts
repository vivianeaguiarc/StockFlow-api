import { Router } from 'express'

import { authenticate } from '../../../shared/http/middlewares/authenticate.js'
import { authorizeRoles } from '../../../shared/http/middlewares/authorize-roles.js'
import { validateRequest } from '../../../shared/http/middlewares/validate-request.js'
import { UsersController } from '../controllers/UsersController.js'
import { createUserSchema } from '../dtos/create-user.dto.js'
import { listUsersQuerySchema } from '../dtos/list-users-query.dto.js'
import { updateUserSchema } from '../dtos/update-user.dto.js'
import { UsersService } from '../services/UsersService.js'

export function createUsersRoutes(): Router {
  const router = Router()
  const usersController = new UsersController(new UsersService())

  router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN'),
    validateRequest(createUserSchema),
    (req, res, next) => usersController.create(req, res, next),
  )

  router.get(
    '/',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateRequest(listUsersQuerySchema, 'query'),
    (req, res, next) => usersController.list(req, res, next),
  )

  router.get('/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER'), (req, res, next) =>
    usersController.getById(req, res, next),
  )

  router.patch(
    '/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    validateRequest(updateUserSchema),
    (req, res, next) => usersController.update(req, res, next),
  )

  router.delete('/:id', authenticate, authorizeRoles('ADMIN'), (req, res, next) =>
    usersController.delete(req, res, next),
  )

  return router
}
