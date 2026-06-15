import type { Prisma } from '@prisma/client'

import { prisma } from '../../../shared/database/prisma.js'
import type { ListLowStockProductsQuery } from '../dtos/list-low-stock-products-query.dto.js'

export function buildLowStockProductsWhere(
  companyId: string,
  query: Pick<ListLowStockProductsQuery, 'name' | 'sku'>,
): Prisma.ProductWhereInput {
  return {
    companyId,
    deletedAt: null,
    active: true,
    quantity: {
      lte: prisma.product.fields.minimumStock,
    },
    ...(query.name && {
      name: { contains: query.name, mode: 'insensitive' },
    }),
    ...(query.sku && {
      sku: { contains: query.sku, mode: 'insensitive' },
    }),
  }
}

export const lowStockProductsOrderBy: Prisma.ProductOrderByWithRelationInput[] = [
  { quantity: 'asc' },
  { name: 'asc' },
]
