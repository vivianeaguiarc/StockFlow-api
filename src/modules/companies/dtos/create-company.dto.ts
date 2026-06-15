import { z } from 'zod'

export const createCompanySchema = z.object({
  name: z.string().trim().min(1, 'Company name is required'),
  document: z.string().trim().min(1).optional(),
  email: z.string().trim().email('Invalid company email'),
  phone: z.string().trim().optional(),
  active: z.boolean().optional(),
})

export type CreateCompanyDto = z.infer<typeof createCompanySchema>
