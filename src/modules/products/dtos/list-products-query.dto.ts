import { z } from 'zod'

import {
  optionalBooleanQuerySchema,
  sortOrderSchema,
} from '../../../shared/dtos/pagination-query.dto.js'

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortOrder: sortOrderSchema.default('desc'),
  name: z.string().trim().min(1).optional(),
  sku: z.string().trim().min(1).optional(),
  active: optionalBooleanQuerySchema,
  categoryId: z.string().cuid().optional(),
  supplierId: z.string().cuid().optional(),
  lowStock: optionalBooleanQuerySchema,
  sortBy: z.enum(['name', 'sku', 'quantity', 'createdAt', 'price']).default('name'),
})

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>
