import { beforeEach, describe, expect, it, vi } from 'vitest'

import { invalidateProductRelatedCache } from '../../src/shared/cache/cache-invalidation.js'
import { cacheService } from '../../src/shared/cache/CacheService.js'

vi.mock('../../src/shared/cache/CacheService.js', () => ({
  cacheService: {
    del: vi.fn().mockResolvedValue(undefined),
    delByPattern: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('product cache invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invalidates list and dashboard caches on product create', async () => {
    await invalidateProductRelatedCache('company-1')

    expect(cacheService.delByPattern).toHaveBeenCalledWith('stockflow:company-1:products:list:*')
    expect(cacheService.delByPattern).toHaveBeenCalledWith(
      'stockflow:company-1:products:low-stock:*',
    )
    expect(cacheService.delByPattern).toHaveBeenCalledWith('stockflow:company-1:dashboard:*')
    expect(cacheService.del).not.toHaveBeenCalled()
  })

  it('also invalidates product detail cache when product id is provided', async () => {
    await invalidateProductRelatedCache('company-1', 'product-1')

    expect(cacheService.del).toHaveBeenCalledWith('stockflow:company-1:products:id:product-1')
  })
})
