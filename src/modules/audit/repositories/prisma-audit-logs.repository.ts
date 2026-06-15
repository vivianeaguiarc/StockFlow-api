import type { Prisma } from '@prisma/client'

import { sanitizeAuditData } from '../../../shared/audit/sanitize-audit-data.js'
import { prisma } from '../../../shared/database/prisma.js'
import type { AuditLogsRepository, CreateAuditLogRecord } from './audit-logs.repository.js'

export class PrismaAuditLogsRepository implements AuditLogsRepository {
  async create(data: CreateAuditLogRecord, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx ?? prisma

    await client.auditLog.create({
      data: {
        companyId: data.companyId,
        userId: data.userId ?? null,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId ?? null,
        ...(data.metadata !== undefined && {
          metadata: sanitizeAuditData(data.metadata),
        }),
        ...(data.oldValue !== undefined && {
          oldValue: sanitizeAuditData(data.oldValue),
        }),
        ...(data.newValue !== undefined && {
          newValue: sanitizeAuditData(data.newValue),
        }),
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    })
  }

  async findMany(
    where: Prisma.AuditLogWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.AuditLogOrderByWithRelationInput,
  ) {
    return prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy,
    })
  }

  async count(where: Prisma.AuditLogWhereInput): Promise<number> {
    return prisma.auditLog.count({ where })
  }

  async findByIdInCompany(companyId: string, logId: string) {
    return prisma.auditLog.findFirst({
      where: {
        id: logId,
        companyId,
      },
    })
  }
}
