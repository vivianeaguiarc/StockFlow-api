import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'

import { registerRoutes } from './shared/http/routes.js'
import { errorHandler, notFoundHandler, requestLogger } from './shared/middlewares/index.js'

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
