import { createHash } from 'node:crypto'

const CACHE_PREFIX = 'stockflow'

export const CACHE_LIST_TTL_SECONDS = 60
export const CACHE_DETAIL_TTL_SECONDS = 300

export function dashboardSummaryKey(companyId: string): string {
  return `${CACHE_PREFIX}:${companyId}:dashboard:summary`
}

export function dashboardLowStockProductsKey(companyId: string): string {
  return `${CACHE_PREFIX}:${companyId}:dashboard:low-stock-products`
}

export function dashboardRecentMovementsKey(companyId: string, limit: number): string {
  return `${CACHE_PREFIX}:${companyId}:dashboard:recent-movements:${limit}`
}

export function productsListKey(companyId: string, queryHash: string): string {
  return `${CACHE_PREFIX}:${companyId}:products:list:${queryHash}`
}

export function productsByIdKey(companyId: string, productId: string): string {
  return `${CACHE_PREFIX}:${companyId}:products:id:${productId}`
}

export function productsDetailCachePattern(companyId: string): string {
  return `${CACHE_PREFIX}:${companyId}:products:id:*`
}

export function dashboardCachePattern(companyId: string): string {
  return `${CACHE_PREFIX}:${companyId}:dashboard:*`
}

export function productsListCachePattern(companyId: string): string {
  return `${CACHE_PREFIX}:${companyId}:products:list:*`
}

export function hashProductsListQuery(query: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(query)).digest('hex').slice(0, 16)
}

export function hashUsersListQuery(query: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(query)).digest('hex').slice(0, 16)
}

export function usersListKey(companyId: string, queryHash: string): string {
  return `${CACHE_PREFIX}:${companyId}:users:list:${queryHash}`
}

export function usersByIdKey(companyId: string, userId: string): string {
  return `${CACHE_PREFIX}:${companyId}:users:id:${userId}`
}

export function authMeKey(userId: string): string {
  return `${CACHE_PREFIX}:auth:me:${userId}`
}

export function usersListCachePattern(companyId: string): string {
  return `${CACHE_PREFIX}:${companyId}:users:list:*`
}
