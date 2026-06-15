import type { AuditAction, Prisma } from '@prisma/client'

import { logWarn } from '../../shared/logger/logger.js'
import { type AuditLogsRepository, auditLogsRepository } from './repositories/index.js'

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
  constructor(private readonly repository: AuditLogsRepository = auditLogsRepository) {}

  async record(input: RecordAuditLogInput): Promise<void> {
    try {
      await this.repository.create(
        {
          companyId: input.companyId,
          userId: input.userId ?? null,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId ?? null,
          ...(input.metadata !== undefined && { metadata: input.metadata }),
          ...(input.oldValue !== undefined && { oldValue: input.oldValue }),
          ...(input.newValue !== undefined && { newValue: input.newValue }),
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
        input.tx,
      )
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
