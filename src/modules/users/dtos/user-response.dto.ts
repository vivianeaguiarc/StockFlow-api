import type { UserRole, UserStatus } from '@prisma/client'

import type { PaginatedResponse } from '../../../shared/types/paginated-response.js'

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

export type PaginatedUsersResponseDto = PaginatedResponse<UserResponseDto>
