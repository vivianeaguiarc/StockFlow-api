import express, { type Express } from 'express'

import { registerSwagger } from './docs/swagger.js'
import { errorHandler } from './shared/http/middlewares/error-handler.js'
import { sanitizeRequestMiddleware } from './shared/http/middlewares/sanitize-request.middleware.js'
import { registerRoutes } from './shared/http/routes.js'
import { httpLogger } from './shared/logger/http-logger.js'
import { notFoundHandler } from './shared/middlewares/index.js'
import { correlationIdMiddleware, requestIdMiddleware } from './shared/observability/index.js'
import { createCorsMiddleware } from './shared/security/cors.js'
import { createHelmetMiddleware } from './shared/security/helmet.js'
import { globalRateLimiter } from './shared/security/rate-limit.js'

export function createApp(): Express {
  const app = express()

  app.disable('x-powered-by')
  app.use(createHelmetMiddleware())
  app.use(createCorsMiddleware())
  app.use(requestIdMiddleware)
  app.use(correlationIdMiddleware)
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))
  app.use(sanitizeRequestMiddleware)
  app.use(httpLogger)
  app.use(globalRateLimiter)

  registerSwagger(app)
  registerRoutes(app)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
