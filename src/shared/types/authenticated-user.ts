import type { UserRole } from '@prisma/client'

export type AuthenticatedUser = {
  id: string
  companyId: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  /** true quando o usuário pertence a uma empresa de demonstração (Company.isDemo) */
  isDemoCompany: boolean
}

export type MeResponseDto = {
  id: string
  companyId: string
  email: string
  role: UserRole
}
