import type { Express } from 'express'

import { env } from '../../config/env.js'
import { createVersionedApiRouter, mountVersionedApiRoutes } from './create-versioned-api-router.js'

export function registerRoutes(app: Express): void {
  const apiRouter = createVersionedApiRouter()
  mountVersionedApiRoutes(app, apiRouter, env.API_PREFIX)
}
