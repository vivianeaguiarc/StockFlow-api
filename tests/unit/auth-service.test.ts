import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthService } from '../../src/modules/auth/services/AuthService.js'
import { auditLogService } from '../../src/modules/audit/audit-log.service.js'
import { refreshTokenService } from '../../src/modules/auth/services/RefreshTokenService.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { prisma } from '../../src/shared/database/prisma.js'
import { buildUser } from '../helpers/factories/user.factory.js'

vi.mock('../../src/modules/audit/audit-log.service.js', () => ({
  auditLogService: {
    record: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('../../src/modules/auth/services/RefreshTokenService.js', () => ({
  refreshTokenService: {
    issue: vi.fn().mockResolvedValue('refresh-token'),
    rotate: vi.fn(),
    revoke: vi.fn(),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('access-token'),
  },
}))

describe('AuthService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('throws 401 for unknown email', async () => {
      vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(null)

      const service = new AuthService()

      await expect(
        service.login({ email: 'missing@example.com', password: 'Test@123456' }),
      ).rejects.toMatchObject({
        message: 'Invalid email or password',
        statusCode: 401,
      } satisfies Partial<AppError>)
    })

    it('throws 401 for invalid password', async () => {
      const user = buildUser({
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash('Correct@123', 12),
        role: 'ADMIN',
      })

      vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(user as never)

      const service = new AuthService()

      await expect(
        service.login({ email: 'admin@example.com', password: 'Wrong@123' }),
      ).rejects.toMatchObject({
        statusCode: 401,
      } satisfies Partial<AppError>)
    })

    it('throws 401 for inactive user', async () => {
      const user = buildUser({
        email: 'inactive@example.com',
        passwordHash: await bcrypt.hash('Test@123456', 12),
        status: 'INACTIVE',
        role: 'ADMIN',
      })

      vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(user as never)

      const service = new AuthService()

      await expect(
        service.login({ email: 'inactive@example.com', password: 'Test@123456' }),
      ).rejects.toMatchObject({
        statusCode: 401,
      } satisfies Partial<AppError>)
    })

    it('throws 401 for inactive company', async () => {
      const user = buildUser({
        email: 'inactive-company@example.com',
        passwordHash: await bcrypt.hash('Test@123456', 12),
        role: 'ADMIN',
        company: { deletedAt: null, status: 'INACTIVE' },
      })

      vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(user as never)

      const service = new AuthService()

      await expect(
        service.login({ email: 'inactive-company@example.com', password: 'Test@123456' }),
      ).rejects.toMatchObject({
        statusCode: 401,
      } satisfies Partial<AppError>)
    })

    it('throws 401 when company is soft-deleted', async () => {
      const user = buildUser({
        email: 'deleted-company@example.com',
        passwordHash: await bcrypt.hash('Test@123456', 12),
        company: { deletedAt: new Date(), status: 'ACTIVE' },
      })

      vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(user as never)

      const service = new AuthService()

      await expect(
        service.login({ email: 'deleted-company@example.com', password: 'Test@123456' }),
      ).rejects.toMatchObject({
        statusCode: 401,
      } satisfies Partial<AppError>)
    })

    it('returns access and refresh tokens for valid credentials', async () => {
      const user = buildUser({
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash('Test@123456', 12),
        role: 'ADMIN',
      })

      vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(user as never)

      const service = new AuthService()
      const result = await service.login({
        email: 'admin@example.com',
        password: 'Test@123456',
      })

      expect(result.accessToken).toBe('access-token')
      expect(result.refreshToken).toBe('refresh-token')
      expect(refreshTokenService.issue).toHaveBeenCalledWith('user-1')
      expect(auditLogService.record).toHaveBeenCalled()
    })
  })

  describe('register', () => {
    it('maps duplicate document conflict to 409', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '6.0.0',
        meta: { target: ['document'] },
      })

      vi.spyOn(prisma, '$transaction').mockRejectedValue(error)

      const service = new AuthService()

      await expect(
        service.register({
          company: {
            name: 'Acme',
            document: '123',
            email: 'company@example.com',
          },
          admin: {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: 'Test@123456',
          },
        }),
      ).rejects.toMatchObject({
        message: 'Company document already registered',
        statusCode: 409,
      } satisfies Partial<AppError>)
    })
  })
})
