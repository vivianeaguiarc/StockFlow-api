import type { NextFunction, Request, Response } from 'express'

import { env } from '../../../config/env.js'
import { AppError } from '../../errors/AppError.js'
import type { ApiErrorResponse } from '../../types/index.js'

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    })
    return
  }

  console.error('[UnhandledError]', {
    name: error.name,
    message: error.message,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  })

  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
  })
}
