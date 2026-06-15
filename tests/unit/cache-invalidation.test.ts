import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  invalidateUserRelatedCache,
  invalidateUsersListCache,
} from '../../src/shared/cache/cache-invalidation.js'
import { cacheService } from '../../src/shared/cache/CacheService.js'

vi.mock('../../src/shared/cache/CacheService.js', () => ({
  cacheService: {
    del: vi.fn().mockResolvedValue(undefined),
    delByPattern: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('user cache invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invalidates only list cache on user create', async () => {
    await invalidateUsersListCache('company-1')

    expect(cacheService.delByPattern).toHaveBeenCalledWith('stockflow:company-1:users:list:*')
    expect(cacheService.del).not.toHaveBeenCalled()
  })

  it('invalidates list, detail and auth/me caches on user update or delete', async () => {
    await invalidateUserRelatedCache('company-1', 'user-1')

    expect(cacheService.delByPattern).toHaveBeenCalledWith('stockflow:company-1:users:list:*')
    expect(cacheService.del).toHaveBeenCalledWith('stockflow:company-1:users:id:user-1')
    expect(cacheService.del).toHaveBeenCalledWith('stockflow:auth:me:user-1')
  })
})
