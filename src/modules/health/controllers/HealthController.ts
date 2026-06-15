import type { NextFunction, Request, Response } from 'express'

import { errorResponse, successResponse } from '../../../shared/http/response.js'
import type { HealthService } from '../services/HealthService.js'

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  handleBasic(_req: Request, res: Response): void {
    successResponse(res, this.healthService.getBasic(), 'Health check successful')
  }

  handleLive(_req: Request, res: Response): void {
    successResponse(res, this.healthService.getLive(), 'Liveness check successful')
  }

  async handleReady(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { body, httpStatus } = await this.healthService.getReady()

      if (httpStatus === 200) {
        successResponse(res, body, 'Readiness check successful')
        return
      }

      errorResponse(res, req, 'Service not ready', httpStatus, { details: [body] })
    } catch (error) {
      next(error)
    }
  }

  async handleDetails(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const details = await this.healthService.getDetails()
      successResponse(res, details, 'Health details retrieved successfully')
    } catch (error) {
      next(error)
    }
  }
}
