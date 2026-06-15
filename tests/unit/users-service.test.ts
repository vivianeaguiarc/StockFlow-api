import { AuditAction, Prisma } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auditLogService } from '../../src/modules/audit/audit-log.service.js'
import { UsersService } from '../../src/modules/users/services/UsersService.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { prisma } from '../../src/shared/database/prisma.js'
import { buildUser } from '../helpers/factories/user.factory.js'

vi.mock('../../src/modules/audit/audit-log.service.js', () => ({
  auditLogService: {
    record: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('UsersService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('creates a user and records audit log', async () => {
    const created = buildUser({ id: 'user-2', email: 'new@example.com' })

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(null)
    vi.spyOn(prisma.user, 'create').mockResolvedValue(created as never)

    const service = new UsersService()
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
  })

  it('throws 409 when email already exists', async () => {
    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue({ id: 'existing' } as never)

    const service = new UsersService()

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

    vi.spyOn(prisma.user, 'findMany').mockResolvedValue(users as never)
    vi.spyOn(prisma.user, 'count').mockResolvedValue(2 as never)

    const service = new UsersService()
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
    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(buildUser() as never)

    const service = new UsersService()
    const user = await service.getById('company-1', 'user-1')

    expect(user.id).toBe('user-1')
  })

  it('throws 404 when user is not found', async () => {
    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(null)

    const service = new UsersService()

    await expect(service.getById('company-1', 'missing')).rejects.toMatchObject({
      statusCode: 404,
    } satisfies Partial<AppError>)
  })

  it('updates user and records audit log', async () => {
    const existing = buildUser({ firstName: 'Old' })
    const updated = buildUser({ firstName: 'New' })

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(existing as never)
    vi.spyOn(prisma.user, 'update').mockResolvedValue(updated as never)

    const service = new UsersService()
    const result = await service.update('company-1', 'admin-1', 'user-1', { firstName: 'New' })

    expect(result.firstName).toBe('New')
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.UPDATE_USER }),
    )
  })

  it('maps Prisma P2002 on update to 409', async () => {
    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(buildUser() as never)
    vi.spyOn(prisma.user, 'update').mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '6.0.0',
      }),
    )

    const service = new UsersService()

    await expect(
      service.update('company-1', 'admin-1', 'user-1', { email: 'dup@example.com' }),
    ).rejects.toMatchObject({
      statusCode: 409,
    } satisfies Partial<AppError>)
  })

  it('prevents deleting yourself', async () => {
    const service = new UsersService()

    await expect(service.delete('company-1', 'user-1', 'user-1', 'user-1')).rejects.toMatchObject({
      message: 'Cannot delete yourself',
      statusCode: 400,
    } satisfies Partial<AppError>)
  })

  it('prevents removing the last active admin', async () => {
    const admin = buildUser({ id: 'admin-1', role: 'ADMIN' })

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(admin as never)
    vi.spyOn(prisma.user, 'count').mockResolvedValue(1 as never)

    const service = new UsersService()

    await expect(
      service.delete('company-1', 'admin-2', 'admin-1', 'admin-2'),
    ).rejects.toMatchObject({
      message: 'Cannot remove the last admin of the company',
      statusCode: 409,
    } satisfies Partial<AppError>)
  })

  it('excludes soft-deleted users from findActiveUserInCompany', async () => {
    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(null)

    const service = new UsersService()

    await expect(service.getById('company-1', 'deleted-user')).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    } satisfies Partial<AppError>)

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'deleted-user',
        companyId: 'company-1',
        deletedAt: null,
      },
    })
  })
})
