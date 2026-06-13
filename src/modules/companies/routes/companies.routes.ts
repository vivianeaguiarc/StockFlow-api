import { Router } from 'express'

import { authenticate } from '../../../shared/http/middlewares/authenticate.js'
import { authorizeRoles } from '../../../shared/http/middlewares/authorize-roles.js'
import { validateRequest } from '../../../shared/http/middlewares/validate-request.js'
import { CompaniesController } from '../controllers/CompaniesController.js'
import { updateCompanySchema } from '../dtos/update-company.dto.js'
import { CompaniesService } from '../services/CompaniesService.js'

export function createCompaniesRoutes(): Router {
  const router = Router()
  const companiesController = new CompaniesController(new CompaniesService())

  router.get('/me', authenticate, (req, res, next) => companiesController.getMe(req, res, next))

  router.patch(
    '/me',
    authenticate,
    authorizeRoles('ADMIN'),
    validateRequest(updateCompanySchema),
    (req, res, next) => companiesController.updateMe(req, res, next),
  )

  return router
}
