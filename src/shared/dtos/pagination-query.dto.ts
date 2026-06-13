import { z } from 'zod'

export const sortOrderSchema = z.enum(['asc', 'desc'])

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortOrder: sortOrderSchema.default('desc'),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export const optionalBooleanQuerySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  if (value === true || value === 'true') {
    return true
  }

  if (value === false || value === 'false') {
    return false
  }

  return value
}, z.boolean().optional())

export const optionalSearchQuerySchema = z
  .string()
  .trim()
  .min(1)
  .optional()
  .transform((value) => value ?? undefined)
