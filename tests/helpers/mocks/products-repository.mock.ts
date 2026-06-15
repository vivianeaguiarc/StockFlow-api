import { vi } from 'vitest'

import type { ProductsRepository } from '../../src/modules/products/repositories/products.repository.js'

export function createProductsRepositoryMock(
  overrides: Partial<ProductsRepository> = {},
): ProductsRepository {
  return {
    create: vi.fn(),
    findActiveInCompany: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    findCategoryInCompany: vi.fn(),
    findSupplierInCompany: vi.fn(),
    ...overrides,
  }
}
