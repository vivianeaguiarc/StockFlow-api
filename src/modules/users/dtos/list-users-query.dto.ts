import { UserRole } from '@prisma/client'
import { z } from 'zod'

import { sortOrderSchema } from '../../../shared/dtos/pagination-query.dto.js'

const optionalFilterSchema = z
  .string()
  .trim()
  .min(1)
  .optional()
  .transform((value) => value ?? undefined)

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortOrder: sortOrderSchema.default('desc'),
  name: optionalFilterSchema,
  email: optionalFilterSchema,
  role: z.nativeEnum(UserRole, { message: 'Role must be ADMIN, MANAGER or USER' }).optional(),
  sortBy: z
    .enum(['createdAt', 'firstName', 'lastName', 'email', 'role', 'status'])
    .default('createdAt'),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
