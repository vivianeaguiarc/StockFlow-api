import { describe, expect, it } from 'vitest'

import { buildProductsListWhere } from '../../src/modules/products/utils/build-products-list-where.js'

describe('buildProductsListWhere', () => {
  it('always scopes to company and non-deleted products', () => {
    expect(buildProductsListWhere('company-1', {})).toEqual({
      companyId: 'company-1',
      deletedAt: null,
    })
  })

  it('applies case-insensitive name filter', () => {
    expect(buildProductsListWhere('company-1', { name: 'notebook' })).toEqual({
      companyId: 'company-1',
      deletedAt: null,
      name: { contains: 'notebook', mode: 'insensitive' },
    })
  })

  it('applies case-insensitive sku filter', () => {
    expect(buildProductsListWhere('company-1', { sku: 'NB-001' })).toEqual({
      companyId: 'company-1',
      deletedAt: null,
      sku: { contains: 'NB-001', mode: 'insensitive' },
    })
  })

  it('applies active filter', () => {
    expect(buildProductsListWhere('company-1', { active: true })).toEqual({
      companyId: 'company-1',
      deletedAt: null,
      active: true,
    })
  })

  it('combines multiple filters', () => {
    expect(
      buildProductsListWhere('company-1', {
        name: 'mouse',
        sku: 'MS',
        active: false,
        categoryId: 'cat-1',
      }),
    ).toEqual({
      companyId: 'company-1',
      deletedAt: null,
      active: false,
      categoryId: 'cat-1',
      name: { contains: 'mouse', mode: 'insensitive' },
      sku: { contains: 'MS', mode: 'insensitive' },
    })
  })
})
