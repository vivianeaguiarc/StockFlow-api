import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginDto = z.infer<typeof loginSchema>

export type LoginResponseDto = {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    companyId: string
    firstName: string
    lastName: string
    email: string
    role: string
  }
}

export type JwtPayload = {
  userId: string
  email: string
  role: string
  companyId: string
}
