import { AuditAction } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthService } from '../../src/modules/auth/services/AuthService.js'
import { RefreshTokenService } from '../../src/modules/auth/services/RefreshTokenService.js'
import { auditLogService } from '../../src/modules/audit/audit-log.service.js'
import { hashRefreshToken } from '../../src/modules/auth/utils/refresh-token.utils.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { createRefreshTokensRepositoryMock } from '../helpers/mocks/refresh-tokens-repository.mock.js'
import { createUsersRepositoryMock } from '../helpers/mocks/users-repository.mock.js'

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
  const usersRepository = createUsersRepositoryMock()
  let refreshTokensRepository = createRefreshTokensRepositoryMock()

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    refreshTokensRepository = createRefreshTokensRepositoryMock()
  })

  function createAuthService(
    refreshTokenService = new RefreshTokenService(refreshTokensRepository),
  ) {
    return new AuthService(usersRepository, refreshTokenService)
  }

  describe('AuthService.login', () => {
    it('returns accessToken and refreshToken on successful login', async () => {
      const user = {
        id: 'user-1',
        companyId: 'company-1',
        firstName: 'Login',
        lastName: 'User',
        email: 'login@example.com',
        passwordHash: await bcrypt.hash('Test@123456', 12),
        role: 'ADMIN' as const,
        status: 'ACTIVE',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: { deletedAt: null, status: 'ACTIVE' },
      }

      vi.mocked(usersRepository.findActiveByEmailWithCompany).mockResolvedValue(user)

      const refreshTokenService = new RefreshTokenService(refreshTokensRepository)
      vi.spyOn(refreshTokenService, 'issue').mockResolvedValue('issued-refresh-token')

      const result = await createAuthService(refreshTokenService).login({
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
        role: 'ADMIN' as const,
        status: 'ACTIVE',
        deletedAt: null,
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        company: { deletedAt: null, status: 'ACTIVE' },
      }

      const refreshTokenService = new RefreshTokenService(refreshTokensRepository)
      vi.spyOn(refreshTokenService, 'rotate').mockResolvedValue({
        token: 'rotated-refresh-token',
        user,
      })

      const result = await createAuthService(refreshTokenService).refresh({
        refreshToken: 'valid-token',
      })

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
      vi.mocked(refreshTokensRepository.findActiveWithUser).mockResolvedValue(null)

      const service = new RefreshTokenService(refreshTokensRepository)

      await expect(service.rotate('expired-token')).rejects.toMatchObject({
        message: 'Unauthorized',
        statusCode: 401,
      } satisfies Partial<AppError>)
    })

    it('returns 401 for revoked refresh token', async () => {
      vi.mocked(refreshTokensRepository.findActiveWithUser).mockResolvedValue(null)

      const service = new RefreshTokenService(refreshTokensRepository)

      await expect(service.rotate('revoked-token')).rejects.toMatchObject({
        message: 'Unauthorized',
        statusCode: 401,
      } satisfies Partial<AppError>)
    })
  })

  describe('RefreshTokenService.issue', () => {
    it('persists only the token hash, never the plain token', async () => {
      const service = new RefreshTokenService(refreshTokensRepository)
      const token = await service.issue('user-1')

      expect(refreshTokensRepository.create).toHaveBeenCalledWith(
        'user-1',
        hashRefreshToken(token),
        expect.any(Date),
      )
    })
  })

  describe('AuthService.logout', () => {
    it('revokes refresh token and records audit log', async () => {
      const user = {
        id: 'user-1',
        companyId: 'company-1',
        email: 'login@example.com',
        role: 'ADMIN' as const,
        firstName: 'Login',
        lastName: 'User',
        status: 'ACTIVE',
        deletedAt: null,
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        company: { deletedAt: null, status: 'ACTIVE' },
      }

      const refreshTokenService = new RefreshTokenService(refreshTokensRepository)
      vi.spyOn(refreshTokenService, 'revoke').mockResolvedValue(user)

      await createAuthService(refreshTokenService).logout({ refreshToken: 'valid-token' })

      expect(auditLogService.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.LOGOUT,
          entity: 'User',
          entityId: 'user-1',
        }),
      )
    })

    it('returns successfully when refresh token is invalid', async () => {
      const refreshTokenService = new RefreshTokenService(refreshTokensRepository)
      vi.spyOn(refreshTokenService, 'revoke').mockResolvedValue(null)

      await expect(
        createAuthService(refreshTokenService).logout({ refreshToken: 'invalid-token' }),
      ).resolves.toBeUndefined()
      expect(auditLogService.record).not.toHaveBeenCalled()
    })
  })
})
