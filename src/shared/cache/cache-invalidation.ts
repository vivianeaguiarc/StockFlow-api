import { dashboardCachePattern, productsListCachePattern } from './cache-keys.js'
import { cacheService } from './CacheService.js'

export async function invalidateProductRelatedCache(companyId: string): Promise<void> {
  await Promise.all([
    cacheService.delByPattern(productsListCachePattern(companyId)),
    cacheService.delByPattern(dashboardCachePattern(companyId)),
  ])
}
