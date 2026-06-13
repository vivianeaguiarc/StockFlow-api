import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'

import { registerSwagger } from './docs/swagger.js'
import { errorHandler } from './shared/http/middlewares/error-handler.js'
import { registerRoutes } from './shared/http/routes.js'
import { httpLogger } from './shared/logger/http-logger.js'
import { notFoundHandler } from './shared/middlewares/index.js'

export function createApp(): Express {
  const app = express()

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  )
  app.use(cors())
  app.use(express.json({ limit: '1mb' }))
  app.use(httpLogger)

  registerSwagger(app)
  registerRoutes(app)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
