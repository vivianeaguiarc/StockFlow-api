import type { Prisma } from '@prisma/client'

import { prisma } from '../../../shared/database/prisma.js'
import type { ListProductsQuery } from '../dtos/list-products-query.dto.js'

type ProductsListFilters = Pick<
  ListProductsQuery,
  'name' | 'sku' | 'active' | 'categoryId' | 'supplierId' | 'lowStock'
>

export function buildProductsListWhere(
  companyId: string,
  query: ProductsListFilters,
): Prisma.ProductWhereInput {
  return {
    companyId,
    deletedAt: null,
    ...(query.active !== undefined && { active: query.active }),
    ...(query.categoryId && { categoryId: query.categoryId }),
    ...(query.supplierId && { supplierId: query.supplierId }),
    ...(query.name && {
      name: { contains: query.name, mode: 'insensitive' },
    }),
    ...(query.sku && {
      sku: { contains: query.sku, mode: 'insensitive' },
    }),
    ...(query.lowStock === true && {
      quantity: {
        lte: prisma.product.fields.minimumStock,
      },
    }),
  }
}
