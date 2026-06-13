import type { SupplierStatus } from '@prisma/client'

import type { PaginatedResponse } from '../../../shared/types/paginated-response.js'

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

export type PaginatedSuppliersResponseDto = PaginatedResponse<SupplierResponseDto>
