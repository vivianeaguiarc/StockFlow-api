import type { AuditAction, Prisma } from '@prisma/client'

import type { AuditContext } from '../../../shared/audit/audit-context.js'
import { sanitizeAuditData } from '../../../shared/audit/sanitize-audit-data.js'
import { prisma } from '../../../shared/database/prisma.js'

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
    const client = input.tx ?? prisma

    await client.auditLog.create({
      data: {
        companyId: input.companyId,
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
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
  }
}

export const auditLogger = new AuditLoggerService()
