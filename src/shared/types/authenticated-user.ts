import type { UserRole } from '@prisma/client'

export type AuthenticatedUser = {
  id: string
  companyId: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
}

export type MeResponseDto = {
  id: string
  companyId: string
  email: string
  role: UserRole
}
