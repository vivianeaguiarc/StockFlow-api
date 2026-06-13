import type { AuditLog } from '@prisma/client'

import { prisma } from '../../../shared/database/prisma.js'
import { AppError } from '../../../shared/errors/AppError.js'
import {
  buildPaginationMeta,
  getPaginationOffset,
  type PaginationParams,
} from '../../../shared/utils/pagination.js'
import type {
  AuditLogResponseDto,
  PaginatedAuditLogsResponseDto,
} from '../dtos/audit-log-response.dto.js'

export class AuditService {
  async listLogs(
    companyId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedAuditLogsResponseDto> {
    const { page, limit } = pagination
    const offset = getPaginationOffset(page, limit)

    const where = { companyId }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ])

    return {
      data: logs.map((log) => this.toResponse(log)),
      meta: buildPaginationMeta(page, limit, total),
    }
  }

  async getLogById(companyId: string, logId: string): Promise<AuditLogResponseDto> {
    const log = await prisma.auditLog.findFirst({
      where: {
        id: logId,
        companyId,
      },
    })

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
      oldValue: log.oldValue,
      newValue: log.newValue,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    }
  }
}
