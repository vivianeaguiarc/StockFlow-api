import type { NextFunction, Request, Response } from 'express'

import { REQUEST_ID_HEADER } from './constants.js'
import type { RequestIdGenerator } from './request-id.generator.js'
import { UuidRequestIdGenerator } from './uuid-request-id.generator.js'

export function createRequestIdMiddleware(
  generator: RequestIdGenerator = new UuidRequestIdGenerator(),
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const requestId = generator.generate()

    req.requestId = requestId
    res.setHeader(REQUEST_ID_HEADER, requestId)

    next()
  }
}

export const requestIdMiddleware = createRequestIdMiddleware()
