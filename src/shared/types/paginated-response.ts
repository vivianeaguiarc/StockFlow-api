export type PaginationMeta = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}
