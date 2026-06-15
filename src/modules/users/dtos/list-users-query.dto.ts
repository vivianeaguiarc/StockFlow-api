import { UserRole, UserStatus } from '@prisma/client'
import { z } from 'zod'

import {
  optionalSearchQuerySchema,
  sortOrderSchema,
} from '../../../shared/dtos/pagination-query.dto.js'

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortOrder: sortOrderSchema.default('desc'),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: optionalSearchQuerySchema,
  sortBy: z
    .enum(['createdAt', 'firstName', 'lastName', 'email', 'role', 'status'])
    .default('createdAt'),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
