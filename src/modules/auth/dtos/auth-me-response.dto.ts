import type { UserRole } from '@prisma/client'

export type AuthMeResponseDto = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}
