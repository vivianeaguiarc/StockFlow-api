import { AuditAction, type InventoryMovement, InventoryMovementType } from '@prisma/client'

import type { AuditContext } from '../../../shared/audit/audit-context.js'
import { invalidateProductRelatedCache } from '../../../shared/cache/cache-invalidation.js'
import { prisma } from '../../../shared/database/prisma.js'
import type { PaginationQuery } from '../../../shared/dtos/pagination-query.dto.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { buildOrderBy, executePaginatedQuery } from '../../../shared/utils/pagination.js'
import { auditLogger } from '../../audit/services/AuditLoggerService.js'
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
          active: true,
        },
      })

      if (!product) {
        throw new AppError('Product not found or inactive', 404)
      }

      const previousQuantity = product.quantity
      const { newQuantity, movementQuantity } = this.calculateQuantities(
        data.type,
        data.quantity,
        previousQuantity,
      )

      await tx.product.update({
        where: { id: product.id },
        data: { quantity: newQuantity },
      })

      const createdMovement = await tx.inventoryMovement.create({
        data: {
          companyId,
          productId: product.id,
          userId,
          type: data.type,
          quantity: movementQuantity,
          previousQuantity,
          newQuantity,
          reason: data.reason,
        },
      })

      await auditLogger.log({
        companyId,
        userId,
        action: this.mapMovementTypeToAuditAction(data.type),
        entity: 'InventoryMovement',
        entityId: createdMovement.id,
        oldValue: {
          productId: product.id,
          quantity: previousQuantity,
        },
        newValue: {
          productId: product.id,
          quantity: newQuantity,
          type: data.type,
          reason: data.reason,
        },
        tx,
        ...auditContext,
      })

      return createdMovement
    })

    await invalidateProductRelatedCache(companyId)

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
        prisma.inventoryMovement.findMany({
          where,
          skip,
          take,
          orderBy,
        }),
      count: () => prisma.inventoryMovement.count({ where }),
    })

    return {
      data: result.data.map((movement) => this.toResponse(movement)),
      pagination: result.pagination,
    }
  }

  async getMovementById(companyId: string, movementId: string): Promise<MovementResponseDto> {
    const movement = await prisma.inventoryMovement.findFirst({
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

  private mapMovementTypeToAuditAction(type: InventoryMovementType): AuditAction {
    switch (type) {
      case InventoryMovementType.ENTRY:
        return AuditAction.STOCK_ENTRY
      case InventoryMovementType.EXIT:
        return AuditAction.STOCK_EXIT
      case InventoryMovementType.ADJUSTMENT:
        return AuditAction.STOCK_ADJUSTMENT
      default: {
        const exhaustiveCheck: never = type
        throw new AppError(`Unsupported movement type: ${String(exhaustiveCheck)}`, 400)
      }
    }
  }

  private calculateQuantities(
    type: InventoryMovementType,
    quantity: number,
    previousQuantity: number,
  ): { newQuantity: number; movementQuantity: number } {
    switch (type) {
      case InventoryMovementType.ENTRY:
        return {
          newQuantity: previousQuantity + quantity,
          movementQuantity: quantity,
        }

      case InventoryMovementType.EXIT:
        if (previousQuantity < quantity) {
          throw new AppError('Insufficient stock', 400)
        }

        return {
          newQuantity: previousQuantity - quantity,
          movementQuantity: quantity,
        }

      case InventoryMovementType.ADJUSTMENT:
        return {
          newQuantity: quantity,
          movementQuantity: quantity,
        }

      default: {
        const exhaustiveCheck: never = type
        throw new AppError(`Unsupported movement type: ${String(exhaustiveCheck)}`, 400)
      }
    }
  }

  private toResponse(movement: InventoryMovement): MovementResponseDto {
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
