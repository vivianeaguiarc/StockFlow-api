import type { NextFunction, Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'

import { env } from '../../src/config/env.js'
import { errorHandler } from '../../src/shared/http/middlewares/error-handler.js'
import { AppError } from '../../src/shared/errors/AppError.js'

function createMockResponse() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
  }

  return response as Response & { statusCode: number; body: unknown }
}

describe('errorHandler security', () => {
  it('includes requestId in error responses', () => {
    const req = { requestId: 'req-123', originalUrl: '/test', method: 'GET' } as Request
    const res = createMockResponse()
    const next = vi.fn() as NextFunction

    errorHandler(new AppError('Forbidden', 403), req, res, next)

    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({
      status: 'error',
      message: 'Forbidden',
      requestId: 'req-123',
    })
  })

  it('does not expose stack trace in production for unexpected errors', () => {
    const originalNodeEnv = env.NODE_ENV
    Object.defineProperty(env, 'NODE_ENV', { value: 'production', configurable: true })

    const req = { requestId: 'req-500', originalUrl: '/boom', method: 'GET' } as Request
    const res = createMockResponse()
    const next = vi.fn() as NextFunction

    errorHandler(new Error('database exploded'), req, res, next)

    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({
      status: 'error',
      message: 'An unexpected error occurred',
      requestId: 'req-500',
    })
    expect(res.body).not.toHaveProperty('stack')

    Object.defineProperty(env, 'NODE_ENV', { value: originalNodeEnv, configurable: true })
  })

  it('returns 413 for oversized payloads', () => {
    const req = { requestId: 'req-413', originalUrl: '/big', method: 'POST' } as Request
    const res = createMockResponse()
    const next = vi.fn() as NextFunction
    const error = new Error('too large') as Error & { type: string }
    error.type = 'entity.too.large'

    errorHandler(error, req, res, next)

    expect(res.statusCode).toBe(413)
    expect(res.body).toMatchObject({
      status: 'error',
      message: 'Payload too large',
      requestId: 'req-413',
    })
  })
})
