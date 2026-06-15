import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UsersService } from '../../src/modules/users/services/UsersService.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { createUsersRepositoryMock } from '../helpers/mocks/users-repository.mock.js'

vi.mock('../../src/modules/audit/audit-log.service.js', () => ({
  auditLogService: {
    record: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('UsersService soft delete', () => {
  const repository = createUsersRepositoryMock()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets deletedAt instead of removing the record', async () => {
    const user = {
      id: 'user-1',
      companyId: 'company-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'USER' as const,
      status: 'ACTIVE',
      passwordHash: 'hash',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      company: { deletedAt: null, active: true },
    }

    vi.mocked(repository.findActiveInCompany).mockResolvedValue(user)
    vi.mocked(repository.countActiveAdmins).mockResolvedValue(2)

    const service = new UsersService(repository)

    await service.delete('company-1', 'admin-1', 'user-1', 'admin-1')

    expect(repository.softDelete).toHaveBeenCalledWith('user-1', expect.any(Date))
  })

  it('throws 404 when deleting a user that is already soft-deleted', async () => {
    vi.mocked(repository.findActiveInCompany).mockResolvedValue(null)

    const service = new UsersService(repository)

    await expect(
      service.delete('company-1', 'admin-1', 'missing-user', 'admin-1'),
    ).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    } satisfies Partial<AppError>)
  })
})
