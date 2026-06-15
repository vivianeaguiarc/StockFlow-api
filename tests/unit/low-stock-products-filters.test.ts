import { describe, expect, it } from 'vitest'

import {
  buildLowStockProductsWhere,
  lowStockProductsOrderBy,
} from '../../src/modules/products/utils/build-low-stock-products-where.js'

describe('buildLowStockProductsWhere', () => {
  it('scopes to company, active, non-deleted products at or below minimum stock', () => {
    expect(buildLowStockProductsWhere('company-1', {})).toEqual({
      companyId: 'company-1',
      deletedAt: null,
      active: true,
      quantity: {
        lte: expect.any(Object),
      },
    })
  })

  it('applies case-insensitive name filter', () => {
    expect(buildLowStockProductsWhere('company-1', { name: 'notebook' })).toEqual({
      companyId: 'company-1',
      deletedAt: null,
      active: true,
      quantity: {
        lte: expect.any(Object),
      },
      name: { contains: 'notebook', mode: 'insensitive' },
    })
  })

  it('applies case-insensitive sku filter', () => {
    expect(buildLowStockProductsWhere('company-1', { sku: 'NB-001' })).toEqual({
      companyId: 'company-1',
      deletedAt: null,
      active: true,
      quantity: {
        lte: expect.any(Object),
      },
      sku: { contains: 'NB-001', mode: 'insensitive' },
    })
  })

  it('orders by quantity asc then name asc', () => {
    expect(lowStockProductsOrderBy).toEqual([{ quantity: 'asc' }, { name: 'asc' }])
  })
})
