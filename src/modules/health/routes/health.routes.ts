import { Router } from 'express'

import { HealthController } from '../controllers/HealthController.js'
import { HealthService } from '../services/HealthService.js'

export function createHealthRoutes(): Router {
  const router = Router()
  const healthService = new HealthService()
  const healthController = new HealthController(healthService)

  router.get('/', (req, res) => healthController.handle(req, res))

  return router
}
