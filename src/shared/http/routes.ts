import type { Express } from 'express'

import { env } from '../../config/env.js'
import { createVersionedApiRouter, mountVersionedApiRoutes } from './create-versioned-api-router.js'
import { handleRoot, handleRootHead } from './root.controller.js'

export function registerRoutes(app: Express): void {
  app.head('/', handleRootHead)
  app.get('/', handleRoot)

  const apiRouter = createVersionedApiRouter()
  mountVersionedApiRoutes(app, apiRouter, env.API_PREFIX)
}
