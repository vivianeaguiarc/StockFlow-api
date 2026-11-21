import type { NextFunction, Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../src/shared/errors/AppError.js'
import {
  blockDemoCompany,
  bodyHasAnyField,
  DEMO_READ_ONLY_MESSAGE,
} from '../../src/shared/http/middlewares/block-demo-company.js'

function buildRequest(isDemoCompany: boolean | undefined, body: unknown = {}): Request {
  return {
    body,
    user:
      isDemoCompany === undefined
        ? undefined
        : {
            id: 'user-1',
            companyId: 'company-1',
            email: 'admin@example.com',
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'User',
            isDemoCompany,
          },
  } as unknown as Request
}

function run(middleware: ReturnType<typeof blockDemoCompany>, req: Request) {
  const next = vi.fn() as unknown as NextFunction & ReturnType<typeof vi.fn>
  middleware(req, {} as Response, next)
  return next
}

describe('blockDemoCompany', () => {
  it('allows requests from regular companies', () => {
    const next = run(blockDemoCompany(), buildRequest(false))

    expect(next).toHaveBeenCalledWith()
  })

  it('allows requests without an authenticated user (auth is handled elsewhere)', () => {
    const next = run(blockDemoCompany(), buildRequest(undefined))

    expect(next).toHaveBeenCalledWith()
  })

  it('blocks demo company with 403 and DEMO_READ_ONLY code', () => {
    const next = run(blockDemoCompany(), buildRequest(true))
    const error = next.mock.calls[0]?.[0] as AppError

    expect(error).toBeInstanceOf(AppError)
    expect(error.statusCode).toBe(403)
    expect(error.code).toBe('DEMO_READ_ONLY')
    expect(error.message).toBe(DEMO_READ_ONLY_MESSAGE)
  })

  it('only blocks demo company when the condition matches', () => {
    const middleware = blockDemoCompany({ when: bodyHasAnyField('password', 'email') })

    expect(run(middleware, buildRequest(true, { firstName: 'New' }))).toHaveBeenCalledWith()

    const blocked = run(middleware, buildRequest(true, { password: 'Hijack@123' }))
    expect((blocked.mock.calls[0]?.[0] as AppError).statusCode).toBe(403)
  })
})

describe('bodyHasAnyField', () => {
  it('detects present fields and ignores undefined values or non-object bodies', () => {
    const check = bodyHasAnyField('password', 'role')

    expect(check({ body: { role: 'USER' } } as Request)).toBe(true)
    expect(check({ body: { role: undefined, firstName: 'X' } } as Request)).toBe(false)
    expect(check({ body: undefined } as Request)).toBe(false)
    expect(check({ body: 'text' } as Request)).toBe(false)
  })
})
