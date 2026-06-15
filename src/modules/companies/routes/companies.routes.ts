import { Router } from 'express'

import { authenticate } from '../../../shared/http/middlewares/authenticate.js'
import { authorizeRoles } from '../../../shared/http/middlewares/authorize-roles.js'
import { validateRequest } from '../../../shared/http/middlewares/validate-request.js'
import { CompaniesController } from '../controllers/CompaniesController.js'
import { createCompanySchema } from '../dtos/create-company.dto.js'
import { listCompaniesQuerySchema } from '../dtos/list-companies-query.dto.js'
import { updateCompanySchema } from '../dtos/update-company.dto.js'
import { updateCompanyCrudSchema } from '../dtos/update-company-crud.dto.js'
import { CompaniesService } from '../services/CompaniesService.js'

export function createCompaniesRoutes(): Router {
  const router = Router()
  const companiesController = new CompaniesController(new CompaniesService())

  router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN'),
    validateRequest(createCompanySchema),
    (req, res, next) => companiesController.create(req, res, next),
  )

  router.get(
    '/',
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER'),
    validateRequest(listCompaniesQuerySchema, 'query'),
    (req, res, next) => companiesController.list(req, res, next),
  )

  router.get('/me', authenticate, (req, res, next) => companiesController.getMe(req, res, next))

  router.patch(
    '/me',
    authenticate,
    authorizeRoles('ADMIN'),
    validateRequest(updateCompanySchema),
    (req, res, next) => companiesController.updateMe(req, res, next),
  )

  router.get('/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER'), (req, res, next) =>
    companiesController.getById(req, res, next),
  )

  router.patch(
    '/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    validateRequest(updateCompanyCrudSchema),
    (req, res, next) => companiesController.updateById(req, res, next),
  )

  router.delete('/:id', authenticate, authorizeRoles('ADMIN'), (req, res, next) =>
    companiesController.deleteById(req, res, next),
  )

  return router
}
