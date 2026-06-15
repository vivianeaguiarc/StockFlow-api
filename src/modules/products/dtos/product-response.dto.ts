import type { PaginatedResponse } from '../../../shared/types/paginated-response.js'

export type ProductResponseDto = {
  id: string
  companyId: string
  name: string
  description: string | null
  sku: string
  price: number
  quantity: number
  minimumStock: number
  active: boolean
  createdAt: Date
  updatedAt: Date
  categoryId: string | null
  supplierId: string | null
  barcode: string | null
}

export type PaginatedProductsResponseDto = PaginatedResponse<ProductResponseDto>
