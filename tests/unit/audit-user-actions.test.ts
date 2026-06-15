import { AuditAction } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthService } from '../../src/modules/auth/services/AuthService.js'
import { RefreshTokenService } from '../../src/modules/auth/services/RefreshTokenService.js'
import { auditLogService } from '../../src/modules/audit/audit-log.service.js'
import { UsersService } from '../../src/modules/users/services/UsersService.js'
import { createRefreshTokensRepositoryMock } from '../helpers/mocks/refresh-tokens-repository.mock.js'
import { createUsersRepositoryMock } from '../helpers/mocks/users-repository.mock.js'

vi.mock('../../src/modules/audit/audit-log.service.js', () => ({
  auditLogService: {
    record: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('../../src/shared/cache/cache-invalidation.js', () => ({
  invalidateUsersListCache: vi.fn().mockResolvedValue(undefined),
  invalidateUserRelatedCache: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../src/modules/companies/repositories/companies.repository.js', () => ({
  companiesRepository: {
    findActiveById: vi.fn().mockResolvedValue({ id: 'company-1', active: true }),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('access-token'),
  },
}))

describe('Audit logs for user actions', () => {
  const usersRepository = createUsersRepositoryMock()
  const refreshTokenService = new RefreshTokenService(createRefreshTokensRepositoryMock())

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(refreshTokenService, 'issue').mockResolvedValue('refresh-token')
  })

  function createAuthService() {
    return new AuthService(usersRepository, refreshTokenService)
  }

  function createUsersService() {
    return new UsersService(usersRepository)
  }

  it('records LOGIN audit log on successful login', async () => {
    const user = {
      id: 'user-1',
      companyId: 'company-1',
      firstName: 'Vivi',
      lastName: 'Admin',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('Test@123456', 12),
      role: 'ADMIN' as const,
      status: 'ACTIVE',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      company: { deletedAt: null, active: true },
    }

    vi.mocked(usersRepository.findActiveByEmailWithCompany).mockResolvedValue(user)

    await createAuthService().login(
      { email: 'admin@example.com', password: 'Test@123456' },
      { ipAddress: '10.0.0.1', userAgent: 'jest-agent' },
    )

    expect(auditLogService.record).toHaveBeenCalledWith({
      companyId: 'company-1',
      userId: 'user-1',
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: 'user-1',
      metadata: {
        email: 'admin@example.com',
        role: 'ADMIN',
      },
      ipAddress: '10.0.0.1',
      userAgent: 'jest-agent',
    })
  })

  it('records CREATE_USER audit log when creating a user', async () => {
    const createdUser = {
      id: 'user-2',
      companyId: 'company-1',
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      role: 'USER' as const,
      status: 'ACTIVE',
      passwordHash: 'hash',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      company: { deletedAt: null, active: true },
    }

    vi.mocked(usersRepository.findActiveByEmail).mockResolvedValue(null)
    vi.mocked(usersRepository.create).mockResolvedValue(createdUser)

    await createUsersService().create(
      'company-1',
      'admin-1',
      {
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        password: 'Test@123456',
        role: 'USER',
      },
      { ipAddress: '10.0.0.2', userAgent: 'vitest' },
    )

    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'company-1',
        userId: 'admin-1',
        action: AuditAction.CREATE_USER,
        entity: 'User',
        entityId: 'user-2',
        ipAddress: '10.0.0.2',
        userAgent: 'vitest',
      }),
    )
  })

  it('records UPDATE_USER audit log when updating a user', async () => {
    const existingUser = {
      id: 'user-2',
      companyId: 'company-1',
      firstName: 'Old',
      lastName: 'Name',
      email: 'old@example.com',
      role: 'USER' as const,
      status: 'ACTIVE',
      passwordHash: 'hash',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      company: { deletedAt: null, active: true },
    }

    const updatedUser = {
      ...existingUser,
      firstName: 'New',
    }

    vi.mocked(usersRepository.findActiveInCompany).mockResolvedValue(existingUser)
    vi.mocked(usersRepository.updateActive).mockResolvedValue(updatedUser)

    await createUsersService().update(
      'company-1',
      'admin-1',
      'user-2',
      { firstName: 'New' },
      { ipAddress: '10.0.0.3', userAgent: 'vitest' },
    )

    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.UPDATE_USER,
        entity: 'User',
        entityId: 'user-2',
        metadata: expect.objectContaining({
          oldValue: expect.objectContaining({ firstName: 'Old' }),
          newValue: expect.objectContaining({ firstName: 'New' }),
        }),
      }),
    )
  })

  it('records DELETE_USER audit log when deleting a user', async () => {
    const user = {
      id: 'user-2',
      companyId: 'company-1',
      firstName: 'Delete',
      lastName: 'Me',
      email: 'delete@example.com',
      role: 'USER' as const,
      status: 'ACTIVE',
      passwordHash: 'hash',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      company: { deletedAt: null, active: true },
    }

    vi.mocked(usersRepository.findActiveInCompany).mockResolvedValue(user)
    vi.mocked(usersRepository.countActiveAdmins).mockResolvedValue(2)
    vi.mocked(usersRepository.softDelete).mockResolvedValue(undefined)

    await createUsersService().delete('company-1', 'admin-1', 'user-2', 'admin-1', {
      ipAddress: '10.0.0.4',
      userAgent: 'vitest',
    })

    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.DELETE_USER,
        entity: 'User',
        entityId: 'user-2',
        metadata: expect.objectContaining({
          oldValue: expect.objectContaining({ email: 'delete@example.com' }),
          deletedAt: expect.any(String),
        }),
      }),
    )
  })

  it('does not fail login when audit log persistence fails', async () => {
    const user = {
      id: 'user-1',
      companyId: 'company-1',
      firstName: 'Vivi',
      lastName: 'Admin',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('Test@123456', 12),
      role: 'ADMIN' as const,
      status: 'ACTIVE',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      company: { deletedAt: null, active: true },
    }

    vi.mocked(usersRepository.findActiveByEmailWithCompany).mockResolvedValue(user)
    vi.mocked(auditLogService.record).mockResolvedValue(undefined)

    await expect(
      createAuthService().login({ email: 'admin@example.com', password: 'Test@123456' }),
    ).resolves.toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
  })
})
