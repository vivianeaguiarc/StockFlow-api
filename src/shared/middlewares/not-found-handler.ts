import type { NextFunction, Request, Response } from 'express'

export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
}
