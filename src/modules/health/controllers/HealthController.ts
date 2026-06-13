import type { NextFunction, Request, Response } from 'express'

import type { HealthService } from '../services/HealthService.js'

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  handleBasic(_req: Request, res: Response): void {
    res.status(200).json(this.healthService.getBasic())
  }

  handleLive(_req: Request, res: Response): void {
    res.status(200).json(this.healthService.getLive())
  }

  async handleReady(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { body, httpStatus } = await this.healthService.getReady()
      res.status(httpStatus).json(body)
    } catch (error) {
      next(error)
    }
  }

  async handleDetails(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const details = await this.healthService.getDetails()
      res.status(200).json(details)
    } catch (error) {
      next(error)
    }
  }
}
