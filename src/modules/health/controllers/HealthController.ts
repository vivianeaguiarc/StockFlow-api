import type { Request, Response } from 'express'

import type { HealthService } from '../services/HealthService.js'

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  handle(_req: Request, res: Response): void {
    const health = this.healthService.execute()
    res.status(200).json(health)
  }
}
