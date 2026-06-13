import { ProductStatus } from '@prisma/client'
import { z } from 'zod'

import {
  optionalBooleanQuerySchema,
  optionalSearchQuerySchema,
  paginationQuerySchema,
} from '../../../shared/dtos/pagination-query.dto.js'

export const listProductsQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(ProductStatus).optional(),
  categoryId: z.string().cuid().optional(),
  supplierId: z.string().cuid().optional(),
  lowStock: optionalBooleanQuerySchema,
  search: optionalSearchQuerySchema,
  sortBy: z.enum(['name', 'sku', 'quantity', 'createdAt', 'salePrice']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>
