import type { Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../src/shared/errors/AppError.js'
import { authorizeRoles, ensureRole } from '../../src/shared/http/middlewares/authorize-roles.js'

function createRequest(role?: 'ADMIN' | 'MANAGER' | 'USER'): Request {
  return {
    user: role
      ? {
          id: 'user-1',
          companyId: 'company-1',
          email: 'user@test.com',
          role,
          firstName: 'Test',
          lastName: 'User',
        }
      : undefined,
  } as Request
}

describe('authorizeRoles / ensureRole', () => {
  it('returns 401 when user is not authenticated', () => {
    const middleware = authorizeRoles('ADMIN')
    const next = vi.fn()

    middleware(createRequest(), {} as Response, next)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect((next.mock.calls[0]?.[0] as AppError).statusCode).toBe(401)
  })

  it('returns 403 when role is not allowed', () => {
    const middleware = authorizeRoles('ADMIN')
    const next = vi.fn()

    middleware(createRequest('USER'), {} as Response, next)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect((next.mock.calls[0]?.[0] as AppError).statusCode).toBe(403)
  })

  it('allows access when role matches', () => {
    const middleware = authorizeRoles('ADMIN', 'MANAGER')
    const next = vi.fn()

    middleware(createRequest('MANAGER'), {} as Response, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('ensureRole is an alias of authorizeRoles', () => {
    expect(ensureRole).toBe(authorizeRoles)
  })
})
