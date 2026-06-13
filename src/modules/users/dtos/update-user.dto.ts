import { z } from 'zod'

export const updateUserSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').optional(),
    lastName: z.string().trim().min(1, 'Last name is required').optional(),
    email: z.string().trim().email('Invalid email').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    role: z
      .enum(['MANAGER', 'EMPLOYEE'], {
        errorMap: () => ({ message: 'Role must be MANAGER or EMPLOYEE' }),
      })
      .optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.email !== undefined ||
      data.password !== undefined ||
      data.role !== undefined ||
      data.status !== undefined,
    { message: 'At least one field must be provided' },
  )

export type UpdateUserDto = z.infer<typeof updateUserSchema>
