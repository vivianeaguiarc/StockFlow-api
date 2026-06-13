import type { NextFunction, Request, Response } from 'express'

import { CORRELATION_ID_HEADER } from './constants.js'
import { readHeaderValue, resolveCorrelationId } from './correlation-id.resolver.js'

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingCorrelationId = readHeaderValue(req.headers[CORRELATION_ID_HEADER.toLowerCase()])
  const correlationId = resolveCorrelationId(incomingCorrelationId, req.requestId)

  req.correlationId = correlationId
  res.setHeader(CORRELATION_ID_HEADER, correlationId)

  next()
}
