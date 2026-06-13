import type { NextFunction, Request, Response } from 'express'

import { env } from '../../../config/env.js'
import { AppError } from '../../errors/AppError.js'
import { logger } from '../../logger/logger.js'
import type { ApiErrorResponse } from '../../types/index.js'

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
        method: req.method,
        route: req.originalUrl,
        statusCode: error.statusCode,
      },
      error.message,
    )

    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    })
    return
  }

  logger.error(
    {
      err: error,
      method: req.method,
      route: req.originalUrl,
      ...(env.NODE_ENV === 'development' && { stack: error.stack }),
    },
    'Unexpected error',
  )

  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
  })
}
