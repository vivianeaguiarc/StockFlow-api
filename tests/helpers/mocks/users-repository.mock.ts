import { vi } from 'vitest'

import type { UsersRepository } from '../../src/modules/users/repositories/users.repository.js'

export function createUsersRepositoryMock(
  overrides: Partial<UsersRepository> = {},
): UsersRepository {
  return {
    findActiveByEmailWithCompany: vi.fn(),
    findActiveByIdWithCompany: vi.fn(),
    findProfileById: vi.fn(),
    findActiveInCompany: vi.fn(),
    findActiveByEmail: vi.fn(),
    create: vi.fn(),
    updateActive: vi.fn(),
    softDelete: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    countActiveAdmins: vi.fn(),
    findActiveAdminInCompany: vi.fn(),
    registerCompanyWithAdmin: vi.fn(),
    ...overrides,
  }
}
