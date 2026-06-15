export class AppError extends Error {
  readonly statusCode: number
  readonly code?: string
  readonly details?: unknown[]

  constructor(
    message: string,
    statusCode: number,
    options?: { code?: string; details?: unknown[] },
  ) {
    super(message)
    this.statusCode = statusCode
    if (options?.code !== undefined) {
      this.code = options.code
    }
    if (options?.details !== undefined) {
      this.details = options.details
    }
    this.name = 'AppError'
    Error.captureStackTrace(this, AppError)
  }
}
