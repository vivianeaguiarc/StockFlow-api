import { z } from 'zod'

import {
  optionalBooleanQuerySchema,
  paginationQuerySchema,
} from '../../../shared/dtos/pagination-query.dto.js'

export const listProductsQuerySchema = paginationQuerySchema.extend({
  name: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  active: optionalBooleanQuerySchema,
  categoryId: z.string().cuid().optional(),
  supplierId: z.string().cuid().optional(),
  lowStock: optionalBooleanQuerySchema,
  sortBy: z.enum(['name', 'sku', 'quantity', 'createdAt', 'price']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>
