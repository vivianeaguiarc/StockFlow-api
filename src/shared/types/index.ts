export type {
  ApiErrorDetails,
  ApiErrorResponse,
  ApiPaginatedSuccessResponse,
  ApiSuccessResponse,
} from './api-response.js'
export type { PaginatedResponse, PaginationMeta } from './paginated-response.js'

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER'

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT'

export type AuditAction =
  | 'LOGIN'
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'CREATE_PRODUCT'
  | 'UPDATE_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'PERMISSION_CHANGED'

export type TenantContext = {
  companyId: string
  userId: string
  role: UserRole
}
