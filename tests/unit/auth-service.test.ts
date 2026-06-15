import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthService } from '../../src/modules/auth/services/AuthService.js'
import { RefreshTokenService } from '../../src/modules/auth/services/RefreshTokenService.js'
import { auditLogService } from '../../src/modules/audit/audit-log.service.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { buildUser } from '../helpers/factories/user.factory.js'
import { createRefreshTokensRepositoryMock } from '../helpers/mocks/refresh-tokens-repository.mock.js'
import { createUsersRepositoryMock } from '../helpers/mocks/users-repository.mock.js'

vi.mock('../../src/modules/audit/audit-log.service.js', () => ({
  auditLogService: {
    record: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('access-token'),
  },
}))

describe('AuthService', () => {
  const usersRepository = createUsersRepositoryMock()
  const refreshTokensRepository = createRefreshTokensRepositoryMock()
  const refreshTokenService = new RefreshTokenService(refreshTokensRepository)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createService() {
    return new AuthService(usersRepository, refreshTokenService)
  }

  describe('login', () => {
    it('throws 401 for unknown email', async () => {
      vi.mocked(usersRepository.findActiveByEmailWithCompany).mockResolvedValue(null)

      await expect(
        createService().login({ email: 'missing@example.com', password: 'Test@123456' }),
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

      vi.mocked(usersRepository.findActiveByEmailWithCompany).mockResolvedValue(user)

      await expect(
        createService().login({ email: 'admin@example.com', password: 'Wrong@123' }),
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

      vi.mocked(usersRepository.findActiveByEmailWithCompany).mockResolvedValue(user)

      await expect(
        createService().login({ email: 'inactive@example.com', password: 'Test@123456' }),
      ).rejects.toMatchObject({
        statusCode: 401,
      } satisfies Partial<AppError>)
    })

    it('throws 401 for inactive company', async () => {
      const user = buildUser({
        email: 'inactive-company@example.com',
        passwordHash: await bcrypt.hash('Test@123456', 12),
        role: 'ADMIN',
        company: { deletedAt: null, active: false },
      })

      vi.mocked(usersRepository.findActiveByEmailWithCompany).mockResolvedValue(user)

      await expect(
        createService().login({ email: 'inactive-company@example.com', password: 'Test@123456' }),
      ).rejects.toMatchObject({
        statusCode: 401,
      } satisfies Partial<AppError>)
    })

    it('throws 401 when company is soft-deleted', async () => {
      const user = buildUser({
        email: 'deleted-company@example.com',
        passwordHash: await bcrypt.hash('Test@123456', 12),
        company: { deletedAt: new Date(), active: true },
      })

      vi.mocked(usersRepository.findActiveByEmailWithCompany).mockResolvedValue(user)

      await expect(
        createService().login({ email: 'deleted-company@example.com', password: 'Test@123456' }),
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

      vi.mocked(usersRepository.findActiveByEmailWithCompany).mockResolvedValue(user)
      vi.spyOn(refreshTokenService, 'issue').mockResolvedValue('refresh-token')

      const result = await createService().login({
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

      vi.mocked(usersRepository.registerCompanyWithAdmin).mockRejectedValue(error)

      await expect(
        createService().register({
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
