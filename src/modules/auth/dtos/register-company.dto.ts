import { z } from 'zod'

export const registerCompanySchema = z.object({
  company: z.object({
    name: z.string().trim().min(1, 'Company name is required'),
    document: z.string().trim().min(1, 'Company document is required').optional(),
    email: z.string().trim().email('Invalid company email'),
    phone: z.string().trim().optional(),
  }),
  admin: z.object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: z.string().trim().email('Invalid admin email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
})

export type RegisterCompanyDto = z.infer<typeof registerCompanySchema>

export type RegisterCompanyResponseDto = {
  company: {
    id: string
    name: string
    email: string
  }
  admin: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: 'ADMIN'
  }
}
