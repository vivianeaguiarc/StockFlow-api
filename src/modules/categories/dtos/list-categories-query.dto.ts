import { CategoryStatus } from '@prisma/client'
import { z } from 'zod'

import {
  optionalSearchQuerySchema,
  paginationQuerySchema,
} from '../../../shared/dtos/pagination-query.dto.js'

export const listCategoriesQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(CategoryStatus).optional(),
  search: optionalSearchQuerySchema,
  sortBy: z.enum(['name', 'createdAt', 'status']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>
