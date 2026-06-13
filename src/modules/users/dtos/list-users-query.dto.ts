import { UserRole, UserStatus } from '@prisma/client'
import { z } from 'zod'

import {
  optionalSearchQuerySchema,
  paginationQuerySchema,
} from '../../../shared/dtos/pagination-query.dto.js'

export const listUsersQuerySchema = paginationQuerySchema.extend({
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: optionalSearchQuerySchema,
  sortBy: z
    .enum(['createdAt', 'firstName', 'lastName', 'email', 'role', 'status'])
    .default('createdAt'),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
