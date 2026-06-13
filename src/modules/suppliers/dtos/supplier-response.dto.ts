import type { SupplierStatus } from '@prisma/client'

export type SupplierResponseDto = {
  id: string
  companyId: string
  corporateName: string
  tradeName: string
  document: string
  email: string | null
  phone: string | null
  status: SupplierStatus
  createdAt: Date
  updatedAt: Date
}

export type PaginatedSuppliersResponseDto = {
  data: SupplierResponseDto[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
