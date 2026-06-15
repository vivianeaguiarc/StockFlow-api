import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UsersService } from '../../src/modules/users/services/UsersService.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { prisma } from '../../src/shared/database/prisma.js'

vi.mock('../../src/modules/audit/audit-log.service.js', () => ({
  auditLogService: {
    record: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('UsersService soft delete', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sets deletedAt instead of removing the record', async () => {
    const user = {
      id: 'user-1',
      companyId: 'company-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(user as never)
    vi.spyOn(prisma.user, 'count').mockResolvedValue(2 as never)
    const updateSpy = vi.spyOn(prisma.user, 'update').mockResolvedValue({
      ...user,
      deletedAt: new Date(),
    } as never)

    const service = new UsersService()

    await service.delete('company-1', 'admin-1', 'user-1', 'admin-1')

    expect(updateSpy).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
        deletedAt: null,
      },
      data: {
        deletedAt: expect.any(Date),
      },
    })
  })

  it('throws 404 when deleting a user that is already soft-deleted', async () => {
    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(null)

    const service = new UsersService()

    await expect(
      service.delete('company-1', 'admin-1', 'missing-user', 'admin-1'),
    ).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    } satisfies Partial<AppError>)
  })
})
