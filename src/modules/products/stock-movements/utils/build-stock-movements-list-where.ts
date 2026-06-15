import type { Prisma } from '@prisma/client'

import type { ListStockMovementsQuery } from '../dtos/list-stock-movements-query.dto.js'

type StockMovementsListFilters = Pick<
  ListStockMovementsQuery,
  'productId' | 'userId' | 'type' | 'startDate' | 'endDate'
>

export function buildStockMovementsListWhere(
  companyId: string,
  query: StockMovementsListFilters,
  routeProductId?: string,
): Prisma.StockMovementWhereInput {
  const productId = routeProductId ?? query.productId

  return {
    companyId,
    ...(productId && { productId }),
    ...(query.userId && { userId: query.userId }),
    ...(query.type && { type: query.type }),
    ...((query.startDate ?? query.endDate) && {
      createdAt: {
        ...(query.startDate && { gte: query.startDate }),
        ...(query.endDate && { lte: query.endDate }),
      },
    }),
  }
}
