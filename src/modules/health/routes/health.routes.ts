import { Router } from 'express'

import { HealthController } from '../controllers/HealthController.js'
import { HealthDependencyChecker } from '../services/HealthDependencyChecker.js'
import { HealthService } from '../services/HealthService.js'

export function createHealthRoutes(): Router {
  const router = Router()
  const healthService = new HealthService(new HealthDependencyChecker())
  const healthController = new HealthController(healthService)

  router.get('/', (req, res) => healthController.handleBasic(req, res))
  router.get('/live', (req, res) => healthController.handleLive(req, res))
  router.get('/ready', (req, res, next) => healthController.handleReady(req, res, next))
  router.get('/details', (req, res, next) => healthController.handleDetails(req, res, next))

  return router
}
