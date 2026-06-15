import { vi } from 'vitest'

import type { CompaniesRepository } from '../../src/modules/companies/repositories/companies.repository.js'

export function createCompaniesRepositoryMock(): CompaniesRepository {
  return {
    create: vi.fn(),
    findActiveById: vi.fn(),
    findAccessibleById: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  }
}
