import type { ProductStatus } from '@prisma/client'

export type ProductResponseDto = {
  id: string
  companyId: string
  categoryId: string
  supplierId: string
  name: string
  description: string | null
  sku: string
  barcode: string | null
  costPrice: number
  salePrice: number
  quantity: number
  minimumStock: number
  status: ProductStatus
  createdAt: Date
  updatedAt: Date
}

export type PaginatedProductsResponseDto = {
  data: ProductResponseDto[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
