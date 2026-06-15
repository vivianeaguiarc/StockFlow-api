import { AuditAction } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthService } from '../../src/modules/auth/services/AuthService.js'
import { RefreshTokenService } from '../../src/modules/auth/services/RefreshTokenService.js'
import { auditLogService } from '../../src/modules/audit/audit-log.service.js'
import { hashRefreshToken } from '../../src/modules/auth/utils/refresh-token.utils.js'
import { prisma } from '../../src/shared/database/prisma.js'
import { AppError } from '../../src/shared/errors/AppError.js'

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('new-access-token'),
  },
}))

vi.mock('../../src/modules/audit/audit-log.service.js', () => ({
  auditLogService: {
    record: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('Refresh token flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  describe('AuthService.login', () => {
    it('returns accessToken and refreshToken on successful login', async () => {
      const user = {
        id: 'user-1',
        companyId: 'company-1',
        firstName: 'Login',
        lastName: 'User',
        email: 'login@example.com',
        passwordHash: await bcrypt.hash('Test@123456', 12),
        role: 'ADMIN',
        status: 'ACTIVE',
        company: { deletedAt: null, status: 'ACTIVE' },
      }

      vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(user as never)
      vi.spyOn(RefreshTokenService.prototype, 'issue').mockResolvedValue('issued-refresh-token')

      const authService = new AuthService()
      const result = await authService.login({
        email: 'login@example.com',
        password: 'Test@123456',
      })

      expect(result).toMatchObject({
        accessToken: 'new-access-token',
        refreshToken: 'issued-refresh-token',
      })
    })
  })

  describe('AuthService.refresh', () => {
    it('generates a new accessToken on valid refresh', async () => {
      const user = {
        id: 'user-1',
        companyId: 'company-1',
        firstName: 'Login',
        lastName: 'User',
        email: 'login@example.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        deletedAt: null,
        company: { deletedAt: null, status: 'ACTIVE' },
      }

      vi.spyOn(RefreshTokenService.prototype, 'rotate').mockResolvedValue({
        token: 'rotated-refresh-token',
        user: user as never,
      })

      const authService = new AuthService()
      const result = await authService.refresh({ refreshToken: 'valid-token' })

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'rotated-refresh-token',
      })
      expect(auditLogService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.REFRESH_TOKEN,
          entity: 'User',
          entityId: 'user-1',
        }),
      )
    })
  })

  describe('RefreshTokenService.rotate', () => {
    it('returns 401 for expired refresh token', async () => {
      vi.spyOn(prisma.refreshToken, 'findFirst').mockResolvedValue(null)

      const service = new RefreshTokenService()

      await expect(service.rotate('expired-token')).rejects.toMatchObject({
        message: 'Unauthorized',
        statusCode: 401,
      } satisfies Partial<AppError>)
    })

    it('returns 401 for revoked refresh token', async () => {
      vi.spyOn(prisma.refreshToken, 'findFirst').mockResolvedValue(null)

      const service = new RefreshTokenService()

      await expect(service.rotate('revoked-token')).rejects.toMatchObject({
        message: 'Unauthorized',
        statusCode: 401,
      } satisfies Partial<AppError>)
    })
  })

  describe('RefreshTokenService.issue', () => {
    it('persists only the token hash, never the plain token', async () => {
      const createSpy = vi.spyOn(prisma.refreshToken, 'create').mockResolvedValue({} as never)

      const service = new RefreshTokenService()
      const token = await service.issue('user-1')

      expect(createSpy).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          tokenHash: hashRefreshToken(token),
        }),
      })
      expect(createSpy.mock.calls[0]?.[0].data.tokenHash).not.toBe(token)
    })
  })

  describe('AuthService.logout', () => {
    it('revokes refresh token and records audit log', async () => {
      const user = {
        id: 'user-1',
        companyId: 'company-1',
        email: 'login@example.com',
        role: 'ADMIN',
      }

      vi.spyOn(RefreshTokenService.prototype, 'revoke').mockResolvedValue(user as never)

      const authService = new AuthService()
      await authService.logout({ refreshToken: 'valid-token' })

      expect(auditLogService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.LOGOUT,
          entity: 'User',
          entityId: 'user-1',
        }),
      )
    })

    it('returns successfully when refresh token is invalid', async () => {
      vi.spyOn(RefreshTokenService.prototype, 'revoke').mockResolvedValue(null)

      const authService = new AuthService()

      await expect(authService.logout({ refreshToken: 'invalid-token' })).resolves.toBeUndefined()
      expect(auditLogService.record).not.toHaveBeenCalled()
    })
  })
})
