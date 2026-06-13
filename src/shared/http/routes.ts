import type { Express, Request, Response } from 'express'
import { Router } from 'express'

import { env } from '../../config/env.js'
import { sendSuccess } from './response.js'

function healthHandler(_req: Request, res: Response): void {
  sendSuccess(res, {
    status: 'ok',
    service: 'stockflow-api',
    timestamp: new Date().toISOString(),
  })
}

export function registerRoutes(app: Express): void {
  app.get('/health', healthHandler)

  const apiRouter = Router()

  apiRouter.get('/', (_req, res) => {
    sendSuccess(res, {
      name: 'StockFlow API',
      version: '1.0.0',
      description: 'SaaS multi-tenant inventory management platform',
    })
  })

  apiRouter.get('/health', healthHandler)

  app.use('/api', apiRouter)

  const v1Router = Router()

  v1Router.get('/', (_req, res) => {
    sendSuccess(res, {
      name: 'StockFlow API',
      version: '1.0.0',
      apiVersion: 'v1',
      description: 'SaaS multi-tenant inventory management platform',
    })
  })

  app.use(env.API_PREFIX, v1Router)
}
