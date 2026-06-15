export type ApiSuccessResponse<T> = {
  status: 'success'
  data: T
}

export type ApiErrorResponse = {
  status: 'error'
  message: string
  requestId?: string
}

export type { PaginatedResponse, PaginationMeta } from './paginated-response.js'

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER'

export type ProductStatus = 'ACTIVE' | 'INACTIVE'

export type InventoryMovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT'

export type AuditAction =
  | 'LOGIN'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'PERMISSION_CHANGED'

export type TenantContext = {
  companyId: string
  userId: string
  role: UserRole
}
