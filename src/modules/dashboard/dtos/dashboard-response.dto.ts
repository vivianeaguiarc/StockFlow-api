export type DashboardSummaryDto = {
  totalUsers: number
  totalCategories: number
  totalSuppliers: number
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  lowStockProducts: number
  totalInventoryMovements: number
  entriesToday: number
  exitsToday: number
  adjustmentsToday: number
}

export type DashboardLowStockProductDto = {
  id: string
  name: string
  sku: string
  quantity: number
  minimumStock: number
  category: {
    id: string
    name: string
  }
  supplier: {
    id: string
    name: string
  }
}

export type DashboardRecentMovementDto = {
  id: string
  type: string
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string
  createdAt: Date
  product: {
    id: string
    name: string
    sku: string
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}
