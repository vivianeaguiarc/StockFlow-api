import { describe, expect, it } from 'vitest'

import {
  dashboardCachePattern,
  dashboardLowStockProductsKey,
  dashboardRecentMovementsKey,
  dashboardSummaryKey,
  hashProductsListQuery,
  productsListCachePattern,
  productsListKey,
} from '../../src/shared/cache/cache-keys.js'
import { isCacheEnabled } from '../../src/shared/cache/redis-client.js'

describe('cache keys', () => {
  const companyId = 'company-abc'

  it('builds tenant-scoped dashboard keys', () => {
    expect(dashboardSummaryKey(companyId)).toBe('stockflow:company-abc:dashboard:summary')
    expect(dashboardLowStockProductsKey(companyId)).toBe(
      'stockflow:company-abc:dashboard:low-stock-products',
    )
    expect(dashboardRecentMovementsKey(companyId, 10)).toBe(
      'stockflow:company-abc:dashboard:recent-movements:10',
    )
  })

  it('builds tenant-scoped products list keys', () => {
    const queryHash = hashProductsListQuery({ page: 1, pageSize: 10 })

    expect(productsListKey(companyId, queryHash)).toBe(
      `stockflow:company-abc:products:list:${queryHash}`,
    )
  })

  it('generates different hashes for different queries', () => {
    const hashA = hashProductsListQuery({ page: 1, pageSize: 10 })
    const hashB = hashProductsListQuery({ page: 2, pageSize: 10 })

    expect(hashA).not.toBe(hashB)
  })

  it('builds invalidation patterns per company', () => {
    expect(dashboardCachePattern(companyId)).toBe('stockflow:company-abc:dashboard:*')
    expect(productsListCachePattern(companyId)).toBe('stockflow:company-abc:products:list:*')
  })

  it('does not mix cache keys between companies', () => {
    const companyA = dashboardSummaryKey('company-a')
    const companyB = dashboardSummaryKey('company-b')

    expect(companyA).not.toBe(companyB)
    expect(companyA.includes('company-a')).toBe(true)
    expect(companyB.includes('company-b')).toBe(true)
  })
})

describe('isCacheEnabled', () => {
  it('disables cache in test environment by default', () => {
    expect(isCacheEnabled()).toBe(false)
  })
})
