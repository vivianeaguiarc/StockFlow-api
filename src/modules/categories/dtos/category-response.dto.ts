import type { CategoryStatus } from '@prisma/client'

import type { PaginatedResponse } from '../../../shared/types/paginated-response.js'

export type CategoryResponseDto = {
  id: string
  companyId: string
  name: string
  description: string | null
  status: CategoryStatus
  createdAt: Date
  updatedAt: Date
}

export type PaginatedCategoriesResponseDto = PaginatedResponse<CategoryResponseDto>
