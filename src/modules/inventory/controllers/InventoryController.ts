import type { NextFunction, Request, Response } from 'express'

import { getAuditContext } from '../../../shared/audit/audit-context.js'
import type { PaginationQuery } from '../../../shared/dtos/pagination-query.dto.js'
import { AppError } from '../../../shared/errors/AppError.js'
import type { CreateMovementDto } from '../dtos/create-movement.dto.js'
import type { InventoryService } from '../services/InventoryService.js'

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  async createMovement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as CreateMovementDto
      const movement = await this.inventoryService.createMovement(
        req.user.companyId,
        req.user.id,
        data,
        getAuditContext(req),
      )
      res.status(201).json(movement)
    } catch (error) {
      next(error)
    }
  }

  async listMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const query = req.query as unknown as PaginationQuery
      const result = await this.inventoryService.listMovements(req.user.companyId, query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async getMovementById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const movement = await this.inventoryService.getMovementById(
        req.user.companyId,
        req.params['id'] as string,
      )
      res.status(200).json(movement)
    } catch (error) {
      next(error)
    }
  }
}
