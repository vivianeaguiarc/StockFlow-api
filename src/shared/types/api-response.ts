import type { PaginationMeta } from './paginated-response.js'

export type ApiSuccessResponse<T> = {
  success: true
  message: string
  data: T
}

export type ApiPaginatedSuccessResponse<T> = {
  success: true
  message: string
  data: T[]
  pagination: PaginationMeta
}

export type ApiErrorDetails = {
  code: string
  details: unknown[]
}

export type ApiErrorResponse = {
  success: false
  message: string
  error: ApiErrorDetails
  requestId?: string
}
