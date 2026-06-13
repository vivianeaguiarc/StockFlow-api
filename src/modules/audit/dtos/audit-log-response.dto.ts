import type { AuditAction } from '@prisma/client'

import type { PaginatedResponse } from '../../../shared/types/paginated-response.js'

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

export type PaginatedAuditLogsResponseDto = PaginatedResponse<AuditLogResponseDto>
