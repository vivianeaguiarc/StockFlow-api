import type { AuditAction } from '@prisma/client'

import type { PaginatedResponse } from '../../../shared/types/paginated-response.js'

export type AuditLogResponseDto = {
  id: string
  companyId: string
  userId: string | null
  action: AuditAction
  entity: string
  entityId: string | null
  metadata: unknown
  oldValue: unknown
  newValue: unknown
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

export type PaginatedAuditLogsResponseDto = PaginatedResponse<AuditLogResponseDto>
