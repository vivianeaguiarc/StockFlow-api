import type { AuditAction } from '@prisma/client'

export type AuditLogResponseDto = {
  id: string
  companyId: string
  userId: string
  action: AuditAction
  entity: string
  entityId: string
  oldValue: unknown
  newValue: unknown
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

export type PaginatedAuditLogsResponseDto = {
  data: AuditLogResponseDto[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
