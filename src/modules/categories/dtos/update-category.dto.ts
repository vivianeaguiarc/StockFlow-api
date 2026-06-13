import { z } from 'zod'

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1, 'Category name is required').optional(),
    description: z.string().trim().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined || data.description !== undefined || data.status !== undefined,
    { message: 'At least one field must be provided' },
  )

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>
