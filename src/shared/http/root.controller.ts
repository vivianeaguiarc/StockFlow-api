import type { Request, Response } from 'express'

import { APP_NAME, APP_VERSION } from '../../config/app-meta.js'
import { env } from '../../config/env.js'
import { successResponse } from './response.js'

export type RootResponseDto = {
  name: string
  status: 'running'
  version: string
  environment: string
  links: {
    docs: string
    health: string
    ready: string
  }
}

export function buildRootResponse(): RootResponseDto {
  return {
    name: APP_NAME,
    status: 'running',
    version: APP_VERSION,
    environment: env.NODE_ENV,
    links: {
      docs: '/api/docs',
      health: `${env.API_PREFIX}/health`,
      ready: `${env.API_PREFIX}/ready`,
    },
  }
}

export function handleRoot(_req: Request, res: Response): void {
  successResponse(res, buildRootResponse(), 'StockFlow API is running')
}

export function handleRootHead(_req: Request, res: Response): void {
  res.sendStatus(200)
}
