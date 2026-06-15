import type { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authenticate } from '../../src/shared/http/middlewares/authenticate.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { prisma } from '../../src/shared/database/prisma.js'
import { buildUser } from '../helpers/factories/user.factory.js'
import {
  createAccessToken,
  createExpiredAccessToken,
  createInvalidAccessToken,
} from '../helpers/factories/token.factory.js'

function createResponse(): { res: Response; next: NextFunction } {
  const next = vi.fn()
  return { res: {} as Response, next }
}

describe('authenticate middleware', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 401 when token is missing', async () => {
    const req = { headers: {} } as Request
    const { res, next } = createResponse()

    await authenticate(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect((next.mock.calls[0]?.[0] as AppError).statusCode).toBe(401)
  })

  it('returns 401 for invalid token', async () => {
    const req = {
      headers: { authorization: `Bearer ${createInvalidAccessToken()}` },
    } as Request
    const { res, next } = createResponse()

    await authenticate(req, res, next)

    expect((next.mock.calls[0]?.[0] as AppError).statusCode).toBe(401)
  })

  it('returns 401 for expired token', async () => {
    const token = createExpiredAccessToken({
      userId: 'user-1',
      companyId: 'company-1',
      role: 'ADMIN',
    })

    const req = { headers: { authorization: `Bearer ${token}` } } as Request
    const { res, next } = createResponse()

    await authenticate(req, res, next)

    expect((next.mock.calls[0]?.[0] as AppError).statusCode).toBe(401)
  })

  it('returns 401 when user is soft-deleted', async () => {
    const token = createAccessToken({
      userId: 'user-1',
      companyId: 'company-1',
      role: 'ADMIN',
    })

    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(
      buildUser({ deletedAt: new Date(), role: 'ADMIN' }) as never,
    )

    const req = { headers: { authorization: `Bearer ${token}` } } as Request
    const { res, next } = createResponse()

    await authenticate(req, res, next)

    expect((next.mock.calls[0]?.[0] as AppError).statusCode).toBe(401)
  })

  it('returns 401 when token payload does not match user role', async () => {
    const token = createAccessToken({
      userId: 'user-1',
      companyId: 'company-1',
      role: 'ADMIN',
    })

    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(buildUser({ role: 'USER' }) as never)

    const req = { headers: { authorization: `Bearer ${token}` } } as Request
    const { res, next } = createResponse()

    await authenticate(req, res, next)

    expect((next.mock.calls[0]?.[0] as AppError).statusCode).toBe(401)
  })

  it('returns 401 when company is inactive', async () => {
    const token = createAccessToken({
      userId: 'user-1',
      companyId: 'company-1',
      role: 'ADMIN',
    })

    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(
      buildUser({
        role: 'ADMIN',
        company: { deletedAt: null, status: 'INACTIVE' },
      }) as never,
    )

    const req = { headers: { authorization: `Bearer ${token}` } } as Request
    const { res, next } = createResponse()

    await authenticate(req, res, next)

    expect((next.mock.calls[0]?.[0] as AppError).statusCode).toBe(401)
  })

  it('attaches user and calls next for valid token', async () => {
    const token = createAccessToken({
      userId: 'user-1',
      companyId: 'company-1',
      role: 'ADMIN',
    })

    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(
      buildUser({ role: 'ADMIN', email: 'admin@example.com' }) as never,
    )

    const req = { headers: { authorization: `Bearer ${token}` } } as Request
    const { res, next } = createResponse()

    await authenticate(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(req.user).toMatchObject({
      id: 'user-1',
      companyId: 'company-1',
      email: 'admin@example.com',
      role: 'ADMIN',
    })
  })
})
