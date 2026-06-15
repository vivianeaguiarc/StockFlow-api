import { describe, expect, it } from 'vitest'

import { buildStockMovementsListWhere } from '../../src/modules/products/stock-movements/utils/build-stock-movements-list-where.js'

describe('buildStockMovementsListWhere', () => {
  it('always scopes to company', () => {
    expect(buildStockMovementsListWhere('company-1', {})).toEqual({
      companyId: 'company-1',
    })
  })

  it('applies product, user and type filters', () => {
    expect(
      buildStockMovementsListWhere('company-1', {
        productId: 'product-1',
        userId: 'user-1',
        type: 'IN',
      }),
    ).toEqual({
      companyId: 'company-1',
      productId: 'product-1',
      userId: 'user-1',
      type: 'IN',
    })
  })

  it('applies date range filter', () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z')
    const endDate = new Date('2026-01-31T23:59:59.999Z')

    expect(buildStockMovementsListWhere('company-1', { startDate, endDate })).toEqual({
      companyId: 'company-1',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    })
  })

  it('uses route productId over query productId', () => {
    expect(
      buildStockMovementsListWhere('company-1', { productId: 'query-product' }, 'route-product'),
    ).toEqual({
      companyId: 'company-1',
      productId: 'route-product',
    })
  })
})
