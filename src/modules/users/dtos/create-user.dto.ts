import { z } from 'zod'

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['MANAGER', 'EMPLOYEE'], {
    errorMap: () => ({ message: 'Role must be MANAGER or EMPLOYEE' }),
  }),
})

export type CreateUserDto = z.infer<typeof createUserSchema>
