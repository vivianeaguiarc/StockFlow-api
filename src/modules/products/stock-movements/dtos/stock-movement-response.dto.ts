import type { PaginatedResponse } from '../../../../shared/types/paginated-response.js'

export type StockMovementListItemDto = {
  id: string
  productId: string
  productName: string
  userId: string
  userName: string
  userEmail: string
  type: string
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string | null
  createdAt: Date
}

export type PaginatedStockMovementsResponseDto = PaginatedResponse<StockMovementListItemDto>

export type StockMovementResponseDto = {
  id: string
  companyId: string
  productId: string
  userId: string
  type: string
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string | null
  createdAt: Date
}
