import { z } from 'zod'

export const updateCompanySchema = z
  .object({
    name: z.string().trim().min(1, 'Company name is required').optional(),
    email: z.string().trim().email('Invalid company email').optional(),
    phone: z.string().trim().optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.email !== undefined || data.phone !== undefined,
    {
      message: 'At least one field must be provided',
    },
  )

export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>

export type CompanyProfileDto = {
  id: string
  name: string
  document: string | null
  email: string
  phone: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}
