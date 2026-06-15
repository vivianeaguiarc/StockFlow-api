import type { PaginationMeta } from '../types/paginated-response.js'

export function buildPaginationMeta(
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit) || 0

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

export function buildOrderBy<T extends string>(
  sortBy: T,
  sortOrder: 'asc' | 'desc',
  allowedFields: readonly T[],
  defaultField: T,
): Record<T, 'asc' | 'desc'> {
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField

  return { [field]: sortOrder } as Record<T, 'asc' | 'desc'>
}

export function buildContainsSearchFilter<T extends string>(
  search: string | undefined,
  fields: readonly T[],
): Array<Record<T, { contains: string; mode: 'insensitive' }>> | undefined {
  if (!search) {
    return undefined
  }

  return fields.map((field) => ({
    [field]: {
      contains: search,
      mode: 'insensitive' as const,
    },
  })) as Array<Record<T, { contains: string; mode: 'insensitive' }>>
}

export async function executePaginatedQuery<T>(options: {
  page: number
  pageSize: number
  findMany: (skip: number, take: number) => Promise<T[]>
  count: () => Promise<number>
}): Promise<{ data: T[]; pagination: PaginationMeta }> {
  const { page, pageSize, findMany, count } = options
  const offset = getPaginationOffset(page, pageSize)

  const [data, totalItems] = await Promise.all([findMany(offset, pageSize), count()])

  return {
    data,
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  }
}
