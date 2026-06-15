import type { NextFunction, Request, Response } from 'express'

import { env } from '../../../config/env.js'
import { AppError } from '../../errors/AppError.js'
import { logger } from '../../logger/logger.js'
import type { ApiErrorResponse } from '../../types/index.js'
import { buildErrorResponseBody } from '../api-response.js'

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
        errorCode: error.code,
      },
      error.message,
    )

    res.status(error.statusCode).json(
      buildErrorResponseBody(req, error.message, {
        statusCode: error.statusCode,
        ...(error.code !== undefined ? { code: error.code } : {}),
        ...(error.details !== undefined ? { details: error.details } : {}),
      }),
    )
    return
  }

  if ('type' in error && error.type === 'entity.too.large') {
    res.status(413).json(
      buildErrorResponseBody(req, 'Payload too large', {
        statusCode: 413,
      }),
    )
    return
  }

  if (error.message === 'Not allowed by CORS') {
    res.status(403).json(
      buildErrorResponseBody(req, 'Origin not allowed', {
        statusCode: 403,
      }),
    )
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

  res.status(500).json(
    buildErrorResponseBody(req, 'An unexpected error occurred', {
      statusCode: 500,
    }),
  )
}
