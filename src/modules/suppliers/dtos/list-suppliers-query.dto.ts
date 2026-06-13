import { SupplierStatus } from '@prisma/client'
import { z } from 'zod'

import {
  optionalSearchQuerySchema,
  paginationQuerySchema,
} from '../../../shared/dtos/pagination-query.dto.js'

export const listSuppliersQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(SupplierStatus).optional(),
  search: optionalSearchQuerySchema,
  sortBy: z.enum(['corporateName', 'tradeName', 'createdAt', 'status']).default('corporateName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type ListSuppliersQuery = z.infer<typeof listSuppliersQuerySchema>
