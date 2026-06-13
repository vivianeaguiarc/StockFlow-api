import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { env } from '../../config/env.js';
import { AppError, ValidationError } from '../errors/index.js';
import type { ApiErrorResponse } from '../types/index.js';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    const details = error.flatten().fieldErrors as Record<string, string[]>;

    res.status(422).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details,
    });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message,
    });
    return;
  }

  console.error('[UnhandledError]', {
    name: error.name,
    message: error.message,
    stack: env.NODE_ENV === 'development' ? error.stack : undefined,
  });

  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
}
