import type { NextFunction, Request, Response } from 'express'

import { AppError } from '../../../shared/errors/AppError.js'
import { successResponse } from '../../../shared/http/response.js'
import type { RecentMovementsQuery } from '../dtos/recent-movements-query.dto.js'
import type { DashboardService } from '../services/DashboardService.js'

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const summary = await this.dashboardService.getSummary(req.user.companyId)
      successResponse(res, summary, 'Dashboard summary retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  async getLowStockProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const products = await this.dashboardService.getLowStockProducts(req.user.companyId)
      successResponse(res, products, 'Low stock products retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  async getRecentMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const query = req.query as unknown as RecentMovementsQuery
      const movements = await this.dashboardService.getRecentMovements(
        req.user.companyId,
        query.limit,
      )
      successResponse(res, movements, 'Recent movements retrieved successfully')
    } catch (error) {
      next(error)
    }
  }
}
