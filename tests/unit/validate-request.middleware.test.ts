import type { Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { AppError } from '../../src/shared/errors/AppError.js'
import { validateRequest } from '../../src/shared/http/middlewares/validate-request.js'

describe('validateRequest middleware', () => {
  it('parses body and calls next on valid input', () => {
    const schema = z.object({ email: z.string().email() })
    const middleware = validateRequest(schema)
    const req = { body: { email: 'user@example.com' } } as Request
    const next = vi.fn()

    middleware(req, {} as Response, next)

    expect(req.body).toEqual({ email: 'user@example.com' })
    expect(next).toHaveBeenCalledWith()
  })

  it('returns 422 for invalid body', () => {
    const schema = z.object({ email: z.string().email() })
    const middleware = validateRequest(schema)
    const req = { body: { email: 'invalid' } } as Request
    const next = vi.fn()

    middleware(req, {} as Response, next)

    expect((next.mock.calls[0]?.[0] as AppError).statusCode).toBe(422)
  })

  it('returns 400 for invalid query', () => {
    const schema = z.object({ page: z.coerce.number().int().min(1) })
    const middleware = validateRequest(schema, 'query')
    const req = { query: { page: '0' } } as Request
    const next = vi.fn()

    middleware(req, {} as Response, next)

    expect((next.mock.calls[0]?.[0] as AppError).statusCode).toBe(400)
  })
})
