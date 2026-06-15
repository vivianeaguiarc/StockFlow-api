import {
  authMeKey,
  dashboardCachePattern,
  productsByIdKey,
  productsListCachePattern,
  usersByIdKey,
  usersListCachePattern,
} from './cache-keys.js'
import { cacheService } from './CacheService.js'

export async function invalidateProductRelatedCache(
  companyId: string,
  productId?: string,
): Promise<void> {
  await Promise.all([
    cacheService.delByPattern(productsListCachePattern(companyId)),
    cacheService.delByPattern(dashboardCachePattern(companyId)),
    ...(productId ? [cacheService.del(productsByIdKey(companyId, productId))] : []),
  ])
}

export async function invalidateUsersListCache(companyId: string): Promise<void> {
  await cacheService.delByPattern(usersListCachePattern(companyId))
}

export async function invalidateUserRelatedCache(companyId: string, userId: string): Promise<void> {
  await Promise.all([
    cacheService.delByPattern(usersListCachePattern(companyId)),
    cacheService.del(usersByIdKey(companyId, userId)),
    cacheService.del(authMeKey(userId)),
  ])
}
