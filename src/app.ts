import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'

import { errorHandler } from './shared/http/middlewares/error-handler.js'
import { registerRoutes } from './shared/http/routes.js'
import { notFoundHandler, requestLogger } from './shared/middlewares/index.js'

export function createApp(): Express {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use(express.json({ limit: '1mb' }))
  app.use(requestLogger)

  registerRoutes(app)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
