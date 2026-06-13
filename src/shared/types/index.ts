export type ApiSuccessResponse<T> = {
  status: 'success'
  data: T
}

export type ApiErrorResponse = {
  status: 'error'
  code: string
  message: string
  details?: Record<string, string[]>
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PaginatedResponse<T> = ApiSuccessResponse<T> & {
  meta: PaginationMeta
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

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
