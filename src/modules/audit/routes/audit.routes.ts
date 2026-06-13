import { Router } from 'express'

import { authenticate } from '../../../shared/http/middlewares/authenticate.js'
import { authorizeRoles } from '../../../shared/http/middlewares/authorize-roles.js'
import { validateRequest } from '../../../shared/http/middlewares/validate-request.js'
import { AuditController } from '../controllers/AuditController.js'
import { listAuditLogsQuerySchema } from '../dtos/list-audit-logs-query.dto.js'
import { AuditService } from '../services/AuditService.js'

export function createAuditRoutes(): Router {
  const router = Router()
  const auditController = new AuditController(new AuditService())

  router.get(
    '/logs',
    authenticate,
    authorizeRoles('ADMIN'),
    validateRequest(listAuditLogsQuerySchema, 'query'),
    (req, res, next) => auditController.listLogs(req, res, next),
  )

  router.get('/logs/:id', authenticate, authorizeRoles('ADMIN'), (req, res, next) =>
    auditController.getLogById(req, res, next),
  )

  return router
}
