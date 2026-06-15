import { AuditAction, type StockMovement, StockMovementType } from '@prisma/client'

import type { AuditContext } from '../../../shared/audit/audit-context.js'
import { invalidateProductRelatedCache } from '../../../shared/cache/cache-invalidation.js'
import { prisma } from '../../../shared/database/prisma.js'
import type { PaginationQuery } from '../../../shared/dtos/pagination-query.dto.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { buildOrderBy, executePaginatedQuery } from '../../../shared/utils/pagination.js'
import { auditLogger } from '../../audit/services/AuditLoggerService.js'
import { calculateStockQuantities } from '../../products/stock-movements/utils/calculate-stock-quantities.js'
import type {
  CreateMovementDto,
  MovementResponseDto,
  PaginatedMovementsResponseDto,
} from '../dtos/create-movement.dto.js'

export class InventoryService {
  async createMovement(
    companyId: string,
    userId: string,
    data: CreateMovementDto,
    auditContext?: AuditContext,
  ): Promise<MovementResponseDto> {
    const movement = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: data.productId,
          companyId,
          deletedAt: null,
        },
      })

      if (!product) {
        throw new AppError('Product not found', 404)
      }

      const previousQuantity = product.quantity
      const movementType = data.type as StockMovementType
      const { newQuantity, movementQuantity } = calculateStockQuantities(
        movementType,
        data.quantity,
        previousQuantity,
      )

      await tx.product.update({
        where: { id: product.id },
        data: { quantity: newQuantity },
      })

      const createdMovement = await tx.stockMovement.create({
        data: {
          companyId,
          productId: product.id,
          userId,
          type: movementType,
          quantity: movementQuantity,
          previousQuantity,
          newQuantity,
          reason: data.reason ?? null,
        },
      })

      await auditLogger.log({
        companyId,
        userId,
        action: this.mapMovementTypeToAuditAction(movementType),
        entity: 'StockMovement',
        entityId: createdMovement.id,
        oldValue: {
          productId: product.id,
          quantity: previousQuantity,
        },
        newValue: {
          productId: product.id,
          quantity: newQuantity,
          type: movementType,
          reason: data.reason ?? null,
        },
        tx,
        ...auditContext,
      })

      return createdMovement
    })

    await invalidateProductRelatedCache(companyId, data.productId)

    return this.toResponse(movement)
  }

  async listMovements(
    companyId: string,
    query: PaginationQuery,
  ): Promise<PaginatedMovementsResponseDto> {
    const { page, pageSize, sortOrder } = query
    const orderBy = buildOrderBy('createdAt', sortOrder, ['createdAt'] as const, 'createdAt')

    const where = { companyId }

    const result = await executePaginatedQuery({
      page,
      pageSize,
      findMany: (skip, take) =>
        prisma.stockMovement.findMany({
          where,
          skip,
          take,
          orderBy,
        }),
      count: () => prisma.stockMovement.count({ where }),
    })

    return {
      data: result.data.map((movement) => this.toResponse(movement)),
      pagination: result.pagination,
    }
  }

  async getMovementById(companyId: string, movementId: string): Promise<MovementResponseDto> {
    const movement = await prisma.stockMovement.findFirst({
      where: {
        id: movementId,
        companyId,
      },
    })

    if (!movement) {
      throw new AppError('Movement not found', 404)
    }

    return this.toResponse(movement)
  }

  private mapMovementTypeToAuditAction(type: StockMovementType): AuditAction {
    switch (type) {
      case StockMovementType.IN:
        return AuditAction.STOCK_ENTRY
      case StockMovementType.OUT:
        return AuditAction.STOCK_EXIT
      case StockMovementType.ADJUSTMENT:
        return AuditAction.STOCK_ADJUSTMENT
      default: {
        const exhaustiveCheck: never = type
        throw new AppError(`Unsupported movement type: ${String(exhaustiveCheck)}`, 400)
      }
    }
  }

  private toResponse(movement: StockMovement): MovementResponseDto {
    return {
      id: movement.id,
      companyId: movement.companyId,
      productId: movement.productId,
      userId: movement.userId,
      type: movement.type,
      quantity: movement.quantity,
      previousQuantity: movement.previousQuantity,
      newQuantity: movement.newQuantity,
      reason: movement.reason,
      createdAt: movement.createdAt,
    }
  }
}
