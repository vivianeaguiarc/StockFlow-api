import type { AuditLogsRepository } from './audit-logs.repository.js'
import { PrismaAuditLogsRepository } from './prisma-audit-logs.repository.js'

export type { AuditLogsRepository, CreateAuditLogRecord } from './audit-logs.repository.js'

export function createAuditLogsRepository(): AuditLogsRepository {
  return new PrismaAuditLogsRepository()
}

export const auditLogsRepository = createAuditLogsRepository()
