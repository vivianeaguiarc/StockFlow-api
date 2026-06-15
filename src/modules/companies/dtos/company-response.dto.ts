import type { PaginatedResponse } from '../../../shared/types/paginated-response.js'

export type CompanyResponseDto = {
  id: string
  name: string
  document: string | null
  email: string
  phone: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type PaginatedCompaniesResponseDto = PaginatedResponse<CompanyResponseDto>
