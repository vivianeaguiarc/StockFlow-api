import type { NextFunction, Request, Response } from 'express'

import { env } from '../../../config/env.js'
import { AppError } from '../../errors/AppError.js'
import { logger } from '../../logger/logger.js'
import type { ApiErrorResponse } from '../../types/index.js'

function buildErrorBody(req: Request, message: string): ApiErrorResponse {
  return {
    status: 'error',
    message,
    requestId: req.requestId,
  }
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    logger.warn(
      {
        err: error,
        requestId: req.requestId,
        correlationId: req.correlationId,
        method: req.method,
        route: req.originalUrl,
        statusCode: error.statusCode,
      },
      error.message,
    )

    res.status(error.statusCode).json(buildErrorBody(req, error.message))
    return
  }

  if ('type' in error && error.type === 'entity.too.large') {
    res.status(413).json(buildErrorBody(req, 'Payload too large'))
    return
  }

  if (error.message === 'Not allowed by CORS') {
    res.status(403).json(buildErrorBody(req, 'Origin not allowed'))
    return
  }

  logger.error(
    {
      err: error,
      requestId: req.requestId,
      correlationId: req.correlationId,
      method: req.method,
      route: req.originalUrl,
      ...(env.NODE_ENV === 'development' && { stack: error.stack }),
    },
    'Unexpected error',
  )

  res.status(500).json(buildErrorBody(req, 'An unexpected error occurred'))
}
