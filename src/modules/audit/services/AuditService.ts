import type { AuditLog, Prisma } from '@prisma/client'

import { AppError } from '../../../shared/errors/AppError.js'
import { buildOrderBy, executePaginatedQuery } from '../../../shared/utils/pagination.js'
import type {
  AuditLogResponseDto,
  PaginatedAuditLogsResponseDto,
} from '../dtos/audit-log-response.dto.js'
import type { ListAuditLogsQuery } from '../dtos/list-audit-logs-query.dto.js'
import { type AuditLogsRepository, auditLogsRepository } from '../repositories/index.js'

export class AuditService {
  constructor(private readonly repository: AuditLogsRepository = auditLogsRepository) {}

  async listLogs(
    companyId: string,
    query: ListAuditLogsQuery,
  ): Promise<PaginatedAuditLogsResponseDto> {
    const { page, pageSize, sortBy, sortOrder, action, entity, userId } = query
    const orderBy = buildOrderBy(
      sortBy,
      sortOrder,
      ['createdAt', 'action', 'entity'] as const,
      'createdAt',
    )

    const where: Prisma.AuditLogWhereInput = {
      companyId,
      ...(action && { action }),
      ...(userId && { userId }),
      ...(entity && { entity: { equals: entity, mode: 'insensitive' } }),
    }

    const result = await executePaginatedQuery({
      page,
      pageSize,
      findMany: (skip, take) => this.repository.findMany(where, skip, take, orderBy),
      count: () => this.repository.count(where),
    })

    return {
      data: result.data.map((log) => this.toResponse(log)),
      pagination: result.pagination,
    }
  }

  async getLogById(companyId: string, logId: string): Promise<AuditLogResponseDto> {
    const log = await this.repository.findByIdInCompany(companyId, logId)

    if (!log) {
      throw new AppError('Audit log not found', 404)
    }

    return this.toResponse(log)
  }

  private toResponse(log: AuditLog): AuditLogResponseDto {
    return {
      id: log.id,
      companyId: log.companyId,
      userId: log.userId,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      metadata: log.metadata,
      oldValue: log.oldValue,
      newValue: log.newValue,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    }
  }
}
