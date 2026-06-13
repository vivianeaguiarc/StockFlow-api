import { createHash } from 'node:crypto'

const CACHE_PREFIX = 'stockflow'

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

export function dashboardCachePattern(companyId: string): string {
  return `${CACHE_PREFIX}:${companyId}:dashboard:*`
}

export function productsListCachePattern(companyId: string): string {
  return `${CACHE_PREFIX}:${companyId}:products:list:*`
}

export function hashProductsListQuery(query: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(query)).digest('hex').slice(0, 16)
}
