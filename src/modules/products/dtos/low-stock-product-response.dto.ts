import type { PaginatedResponse } from '../../../shared/types/paginated-response.js'

export type LowStockProductResponseDto = {
  id: string
  name: string
  sku: string
  quantity: number
  minimumStock: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type PaginatedLowStockProductsResponseDto = PaginatedResponse<LowStockProductResponseDto>
