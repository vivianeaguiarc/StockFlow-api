import type { UserRole, UserStatus } from '@prisma/client'

export type UserResponseDto = {
  id: string
  companyId: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export type PaginatedUsersResponseDto = {
  data: UserResponseDto[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
