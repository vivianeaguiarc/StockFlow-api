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
  pagination: UsersPaginationMeta
}

export type UsersPaginationMeta = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
