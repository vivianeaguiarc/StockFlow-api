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
