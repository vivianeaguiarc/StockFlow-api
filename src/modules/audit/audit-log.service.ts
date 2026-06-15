import type { AuditAction, Prisma } from '@prisma/client'

import { sanitizeAuditData } from '../../shared/audit/sanitize-audit-data.js'
import { prisma } from '../../shared/database/prisma.js'
import { logWarn } from '../../shared/logger/logger.js'

export type RecordAuditLogInput = {
  companyId: string
  userId?: string | null
  action: AuditAction
  entity: string
  entityId?: string | null
  metadata?: unknown
  oldValue?: unknown
  newValue?: unknown
  ipAddress?: string | null
  userAgent?: string | null
  tx?: Prisma.TransactionClient
}

export class AuditLogService {
  async record(input: RecordAuditLogInput): Promise<void> {
    try {
      const client = input.tx ?? prisma

      await client.auditLog.create({
        data: {
          companyId: input.companyId,
          userId: input.userId ?? null,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId ?? null,
          ...(input.metadata !== undefined && {
            metadata: sanitizeAuditData(input.metadata),
          }),
          ...(input.oldValue !== undefined && {
            oldValue: sanitizeAuditData(input.oldValue),
          }),
          ...(input.newValue !== undefined && {
            newValue: sanitizeAuditData(input.newValue),
          }),
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      })
    } catch (error) {
      logWarn(
        {
          err: error,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          userId: input.userId,
        },
        'Failed to persist audit log',
      )
    }
  }
}

export const auditLogService = new AuditLogService()
