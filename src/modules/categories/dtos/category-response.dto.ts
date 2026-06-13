import type { CategoryStatus } from '@prisma/client'

export type CategoryResponseDto = {
  id: string
  companyId: string
  name: string
  description: string | null
  status: CategoryStatus
  createdAt: Date
  updatedAt: Date
}

export type PaginatedCategoriesResponseDto = {
  data: CategoryResponseDto[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
