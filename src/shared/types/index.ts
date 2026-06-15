export type {
  ApiErrorDetails,
  ApiErrorResponse,
  ApiPaginatedSuccessResponse,
  ApiSuccessResponse,
} from './api-response.js'
export type { PaginatedResponse, PaginationMeta } from './paginated-response.js'

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER'

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
