import type { NextFunction, Request, Response } from 'express'

import { logger } from './logger.js'

export function httpLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint()

  res.on('finish', () => {
    const durationMs = Math.round((Number(process.hrtime.bigint() - start) / 1_000_000) * 100) / 100

    logger.info(
      {
        requestId: req.requestId,
        correlationId: req.correlationId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        ip: req.ip ?? req.socket.remoteAddress ?? null,
        userAgent: req.get('user-agent') ?? null,
      },
      'request completed',
    )
  })

  next()
}
