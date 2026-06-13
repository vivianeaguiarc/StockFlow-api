export abstract class AppError extends Error {
  abstract readonly statusCode: number
  abstract readonly code: string
  readonly isOperational = true

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  readonly statusCode = 400
  readonly code = 'BAD_REQUEST'
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401
  readonly code = 'UNAUTHORIZED'
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403
  readonly code = 'FORBIDDEN'
}

export class NotFoundError extends AppError {
  readonly statusCode = 404
  readonly code = 'NOT_FOUND'
}

export class ConflictError extends AppError {
  readonly statusCode = 409
  readonly code = 'CONFLICT'
}

export class ValidationError extends AppError {
  readonly statusCode = 422
  readonly code = 'VALIDATION_ERROR'

  constructor(
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message)
  }
}

export class InternalServerError extends AppError {
  readonly statusCode = 500
  readonly code = 'INTERNAL_SERVER_ERROR'
}
