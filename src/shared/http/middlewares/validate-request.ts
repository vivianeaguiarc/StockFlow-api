import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'
import { ZodError } from 'zod'

import { AppError } from '../../errors/AppError.js'

type RequestSource = 'body' | 'query' | 'params'

export function validateRequest(schema: ZodSchema, source: RequestSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source])

      if (source === 'query') {
        Object.defineProperty(req, 'query', {
          value: parsed,
          writable: true,
          configurable: true,
          enumerable: true,
        })
      } else {
        req[source] = parsed
      }

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((issue) => issue.message).join(', ')
        next(new AppError(message, 422))
        return
      }

      next(error)
    }
  }
}
