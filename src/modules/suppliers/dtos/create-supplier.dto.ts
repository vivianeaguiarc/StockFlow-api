import { z } from 'zod'

export const createSupplierSchema = z.object({
  corporateName: z.string().trim().min(1, 'Corporate name is required'),
  tradeName: z.string().trim().min(1, 'Trade name is required'),
  document: z.string().trim().min(1, 'Document is required'),
  email: z.string().trim().email('Invalid email').optional(),
  phone: z.string().trim().optional(),
})

export type CreateSupplierDto = z.infer<typeof createSupplierSchema>
