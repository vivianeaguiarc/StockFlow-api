import type { AuditAction, Prisma } from '@prisma/client'

import type { AuditContext } from '../../../shared/audit/audit-context.js'
import { auditLogService } from '../audit-log.service.js'

export type CreateAuditLogInput = {
  companyId: string
  userId: string
  action: AuditAction
  entity: string
  entityId: string
  oldValue?: unknown
  newValue?: unknown
  tx?: Prisma.TransactionClient
} & AuditContext

export class AuditLoggerService {
  async log(input: CreateAuditLogInput): Promise<void> {
    await auditLogService.record({
      companyId: input.companyId,
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      oldValue: input.oldValue,
      newValue: input.newValue,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      ...(input.tx !== undefined && { tx: input.tx }),
    })
  }
}

export const auditLogger = new AuditLoggerService()
