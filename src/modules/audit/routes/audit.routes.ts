import { Router } from 'express'

import { authenticate } from '../../../shared/http/middlewares/authenticate.js'
import { authorizeRoles } from '../../../shared/http/middlewares/authorize-roles.js'
import { validateRequest } from '../../../shared/http/middlewares/validate-request.js'
import { paginationSchema } from '../../../shared/utils/pagination.js'
import { AuditController } from '../controllers/AuditController.js'
import { AuditService } from '../services/AuditService.js'

export function createAuditRoutes(): Router {
  const router = Router()
  const auditController = new AuditController(new AuditService())

  router.get(
    '/logs',
    authenticate,
    authorizeRoles('ADMIN'),
    validateRequest(paginationSchema, 'query'),
    (req, res, next) => auditController.listLogs(req, res, next),
  )

  router.get('/logs/:id', authenticate, authorizeRoles('ADMIN'), (req, res, next) =>
    auditController.getLogById(req, res, next),
  )

  return router
}
