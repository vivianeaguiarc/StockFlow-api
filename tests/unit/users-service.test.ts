import { AuditAction, Prisma } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auditLogService } from '../../src/modules/audit/audit-log.service.js'
import { UsersService } from '../../src/modules/users/services/UsersService.js'
import {
  invalidateUserRelatedCache,
  invalidateUsersListCache,
} from '../../src/shared/cache/cache-invalidation.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { buildUser } from '../helpers/factories/user.factory.js'
import { createUsersRepositoryMock } from '../helpers/mocks/users-repository.mock.js'

vi.mock('../../src/modules/audit/audit-log.service.js', () => ({
  auditLogService: {
    record: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('../../src/shared/cache/CacheService.js', () => ({
  cacheService: {
    getOrSet: vi.fn((_key: string, fetcher: () => Promise<unknown>) => fetcher()),
    del: vi.fn().mockResolvedValue(undefined),
    delByPattern: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('../../src/shared/cache/cache-invalidation.js', () => ({
  invalidateUsersListCache: vi.fn().mockResolvedValue(undefined),
  invalidateUserRelatedCache: vi.fn().mockResolvedValue(undefined),
}))

describe('UsersService', () => {
  const repository = createUsersRepositoryMock()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a user and records audit log', async () => {
    const created = buildUser({ id: 'user-2', email: 'new@example.com' })

    vi.mocked(repository.findActiveByEmail).mockResolvedValue(null)
    vi.mocked(repository.create).mockResolvedValue(created)

    const service = new UsersService(repository)
    const result = await service.create('company-1', 'admin-1', {
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      password: 'Test@123456',
      role: 'USER',
    })

    expect(result.email).toBe('new@example.com')
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.CREATE_USER,
        entityId: 'user-2',
      }),
    )
    expect(invalidateUsersListCache).toHaveBeenCalledWith('company-1')
  })

  it('throws 409 when email already exists', async () => {
    vi.mocked(repository.findActiveByEmail).mockResolvedValue({ id: 'existing' })

    const service = new UsersService(repository)

    await expect(
      service.create('company-1', 'admin-1', {
        firstName: 'Dup',
        lastName: 'User',
        email: 'dup@example.com',
        password: 'Test@123456',
        role: 'USER',
      }),
    ).rejects.toMatchObject({
      message: 'Email already registered',
      statusCode: 409,
    } satisfies Partial<AppError>)
  })

  it('lists users with pagination metadata', async () => {
    const users = [buildUser(), buildUser({ id: 'user-2', email: 'two@example.com' })]

    vi.mocked(repository.findMany).mockResolvedValue(users)
    vi.mocked(repository.count).mockResolvedValue(2)

    const service = new UsersService(repository)
    const result = await service.list('company-1', {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })

    expect(result.data).toHaveLength(2)
    expect(result.pagination).toMatchObject({
      page: 1,
      limit: 10,
      totalItems: 2,
    })
  })

  it('returns user by id', async () => {
    vi.mocked(repository.findActiveInCompany).mockResolvedValue(buildUser())

    const service = new UsersService(repository)
    const user = await service.getById('company-1', 'user-1')

    expect(user.id).toBe('user-1')
  })

  it('throws 404 when user is not found', async () => {
    vi.mocked(repository.findActiveInCompany).mockResolvedValue(null)

    const service = new UsersService(repository)

    await expect(service.getById('company-1', 'missing')).rejects.toMatchObject({
      statusCode: 404,
    } satisfies Partial<AppError>)
  })

  it('updates user and records audit log', async () => {
    const existing = buildUser({ firstName: 'Old' })
    const updated = buildUser({ firstName: 'New' })

    vi.mocked(repository.findActiveInCompany).mockResolvedValue(existing)
    vi.mocked(repository.updateActive).mockResolvedValue(updated)

    const service = new UsersService(repository)
    const result = await service.update('company-1', 'admin-1', 'user-1', { firstName: 'New' })

    expect(result.firstName).toBe('New')
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.UPDATE_USER }),
    )
    expect(invalidateUserRelatedCache).toHaveBeenCalledWith('company-1', 'user-1')
  })

  it('maps Prisma P2002 on update to 409', async () => {
    vi.mocked(repository.findActiveInCompany).mockResolvedValue(buildUser())
    vi.mocked(repository.updateActive).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '6.0.0',
      }),
    )

    const service = new UsersService(repository)

    await expect(
      service.update('company-1', 'admin-1', 'user-1', { email: 'dup@example.com' }),
    ).rejects.toMatchObject({
      statusCode: 409,
    } satisfies Partial<AppError>)
  })

  it('invalidates cache after soft delete', async () => {
    const user = buildUser({ role: 'USER' })

    vi.mocked(repository.findActiveInCompany).mockResolvedValue(user)
    vi.mocked(repository.softDelete).mockResolvedValue(undefined)

    const service = new UsersService(repository)
    await service.delete('company-1', 'admin-1', 'user-1', 'admin-1')

    expect(invalidateUserRelatedCache).toHaveBeenCalledWith('company-1', 'user-1')
    expect(repository.softDelete).toHaveBeenCalledWith('user-1', expect.any(Date))
  })

  it('prevents deleting yourself', async () => {
    const service = new UsersService(repository)

    await expect(service.delete('company-1', 'user-1', 'user-1', 'user-1')).rejects.toMatchObject({
      message: 'Cannot delete yourself',
      statusCode: 400,
    } satisfies Partial<AppError>)
  })

  it('prevents removing the last active admin', async () => {
    const admin = buildUser({ id: 'admin-1', role: 'ADMIN' })

    vi.mocked(repository.findActiveInCompany).mockResolvedValue(admin)
    vi.mocked(repository.countActiveAdmins).mockResolvedValue(1)
    vi.mocked(repository.findActiveAdminInCompany).mockResolvedValue(admin)

    const service = new UsersService(repository)

    await expect(
      service.delete('company-1', 'admin-2', 'admin-1', 'admin-2'),
    ).rejects.toMatchObject({
      message: 'Cannot remove the last admin of the company',
      statusCode: 409,
    } satisfies Partial<AppError>)
  })

  it('excludes soft-deleted users from findActiveUserInCompany', async () => {
    vi.mocked(repository.findActiveInCompany).mockResolvedValue(null)

    const service = new UsersService(repository)

    await expect(service.getById('company-1', 'deleted-user')).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    } satisfies Partial<AppError>)

    expect(repository.findActiveInCompany).toHaveBeenCalledWith('company-1', 'deleted-user')
  })
})
