import { describe, expect, it } from 'vitest'

import {
  authMeKey,
  CACHE_DETAIL_TTL_SECONDS,
  CACHE_LIST_TTL_SECONDS,
  dashboardCachePattern,
  dashboardLowStockProductsKey,
  dashboardRecentMovementsKey,
  dashboardSummaryKey,
  hashProductsListQuery,
  hashUsersListQuery,
  productsListCachePattern,
  productsListKey,
  productsByIdKey,
  usersByIdKey,
  usersListCachePattern,
  usersListKey,
} from '../../src/shared/cache/cache-keys.js'
import { isCacheEnabled } from '../../src/shared/cache/redis-client.js'

describe('cache keys', () => {
  const companyId = 'company-abc'

  it('defines TTL constants for list and detail caches', () => {
    expect(CACHE_LIST_TTL_SECONDS).toBe(60)
    expect(CACHE_DETAIL_TTL_SECONDS).toBe(300)
  })

  it('builds tenant-scoped dashboard keys', () => {
    expect(dashboardSummaryKey(companyId)).toBe('stockflow:company-abc:dashboard:summary')
    expect(dashboardLowStockProductsKey(companyId)).toBe(
      'stockflow:company-abc:dashboard:low-stock-products',
    )
    expect(dashboardRecentMovementsKey(companyId, 10)).toBe(
      'stockflow:company-abc:dashboard:recent-movements:10',
    )
  })

  it('builds tenant-scoped products list and detail keys', () => {
    const queryHash = hashProductsListQuery({ page: 1, pageSize: 10 })

    expect(productsListKey(companyId, queryHash)).toBe(
      `stockflow:company-abc:products:list:${queryHash}`,
    )
    expect(productsByIdKey(companyId, 'product-1')).toBe(
      'stockflow:company-abc:products:id:product-1',
    )
  })

  it('builds tenant-scoped users list and detail keys', () => {
    const queryHash = hashUsersListQuery({ page: 1, limit: 10 })

    expect(usersListKey(companyId, queryHash)).toBe(`stockflow:company-abc:users:list:${queryHash}`)
    expect(usersByIdKey(companyId, 'user-1')).toBe('stockflow:company-abc:users:id:user-1')
    expect(authMeKey('user-1')).toBe('stockflow:auth:me:user-1')
  })

  it('generates different hashes for different queries', () => {
    const hashA = hashProductsListQuery({ page: 1, pageSize: 10 })
    const hashB = hashProductsListQuery({ page: 2, pageSize: 10 })
    const usersHashA = hashUsersListQuery({ page: 1, limit: 10 })
    const usersHashB = hashUsersListQuery({ page: 2, limit: 10 })

    expect(hashA).not.toBe(hashB)
    expect(usersHashA).not.toBe(usersHashB)
  })

  it('builds invalidation patterns per company', () => {
    expect(dashboardCachePattern(companyId)).toBe('stockflow:company-abc:dashboard:*')
    expect(productsListCachePattern(companyId)).toBe('stockflow:company-abc:products:list:*')
    expect(usersListCachePattern(companyId)).toBe('stockflow:company-abc:users:list:*')
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
