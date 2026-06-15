import type { AuditLog, Prisma } from '@prisma/client'

export type CreateAuditLogRecord = {
  companyId: string
  userId?: string | null
  action: Prisma.AuditLogCreateInput['action']
  entity: string
  entityId?: string | null
  metadata?: unknown
  oldValue?: unknown
  newValue?: unknown
  ipAddress?: string | null
  userAgent?: string | null
}

export interface AuditLogsRepository {
  create(data: CreateAuditLogRecord, tx?: Prisma.TransactionClient): Promise<void>
  findMany(
    where: Prisma.AuditLogWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.AuditLogOrderByWithRelationInput,
  ): Promise<AuditLog[]>
  count(where: Prisma.AuditLogWhereInput): Promise<number>
  findByIdInCompany(companyId: string, logId: string): Promise<AuditLog | null>
}
