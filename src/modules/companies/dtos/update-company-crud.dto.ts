import { z } from 'zod'

export const updateCompanyCrudSchema = z
  .object({
    name: z.string().trim().min(1, 'Company name is required').optional(),
    document: z.string().trim().min(1).nullable().optional(),
    email: z.string().trim().email('Invalid company email').optional(),
    phone: z.string().trim().nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.document !== undefined ||
      data.email !== undefined ||
      data.phone !== undefined ||
      data.active !== undefined,
    {
      message: 'At least one field must be provided',
    },
  )

export type UpdateCompanyCrudDto = z.infer<typeof updateCompanyCrudSchema>
