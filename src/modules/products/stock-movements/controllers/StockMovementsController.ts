import type { NextFunction, Request, Response } from 'express'

import { getAuditContext } from '../../../../shared/audit/audit-context.js'
import { AppError } from '../../../../shared/errors/AppError.js'
import { sendCreated } from '../../../../shared/http/response.js'
import type { CreateStockMovementDto } from '../dtos/create-stock-movement.dto.js'
import type { StockMovementsService } from '../services/StockMovementsService.js'

export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as CreateStockMovementDto
      const movement = await this.stockMovementsService.create(
        req.user.companyId,
        req.user.id,
        req.params['productId'] as string,
        data,
        getAuditContext(req),
      )
      sendCreated(res, movement, 'Stock movement created successfully')
    } catch (error) {
      next(error)
    }
  }
}
