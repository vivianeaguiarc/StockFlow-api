import { vi } from 'vitest'

import type { StockMovementsRepository } from '../../src/modules/products/stock-movements/repositories/stock-movements.repository.js'

export function createStockMovementsRepositoryMock(
  overrides: Partial<StockMovementsRepository> = {},
): StockMovementsRepository {
  return {
    findProductForMovement: vi.fn(),
    createMovement: vi.fn(),
    updateProductQuantity: vi.fn(),
    runInTransaction: vi.fn(),
    ...overrides,
  }
}
