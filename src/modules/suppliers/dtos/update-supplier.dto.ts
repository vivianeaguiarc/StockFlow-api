import { z } from 'zod'

export const updateSupplierSchema = z
  .object({
    corporateName: z.string().trim().min(1, 'Corporate name is required').optional(),
    tradeName: z.string().trim().min(1, 'Trade name is required').optional(),
    document: z.string().trim().min(1, 'Document is required').optional(),
    email: z.string().trim().email('Invalid email').optional(),
    phone: z.string().trim().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine(
    (data) =>
      data.corporateName !== undefined ||
      data.tradeName !== undefined ||
      data.document !== undefined ||
      data.email !== undefined ||
      data.phone !== undefined ||
      data.status !== undefined,
    { message: 'At least one field must be provided' },
  )

export type UpdateSupplierDto = z.infer<typeof updateSupplierSchema>
