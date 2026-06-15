import type { NextFunction, Request, Response } from 'express'

import { AppError } from '../../../shared/errors/AppError.js'
import { paginatedResponse, successResponse } from '../../../shared/http/response.js'
import type { ListAuditLogsQuery } from '../dtos/list-audit-logs-query.dto.js'
import type { AuditService } from '../services/AuditService.js'

export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  async listLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const query = req.query as unknown as ListAuditLogsQuery
      const result = await this.auditService.listLogs(req.user.companyId, query)
      paginatedResponse(res, result, 'Audit logs retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  async getLogById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const log = await this.auditService.getLogById(req.user.companyId, req.params['id'] as string)
      successResponse(res, log, 'Audit log retrieved successfully')
    } catch (error) {
      next(error)
    }
  }
}
