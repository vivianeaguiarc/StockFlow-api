import type { StockMovementType } from '@prisma/client'
import { AuditAction, type StockMovement } from '@prisma/client'

import type { AuditContext } from '../../../../shared/audit/audit-context.js'
import { invalidateProductRelatedCache } from '../../../../shared/cache/cache-invalidation.js'
import { AppError } from '../../../../shared/errors/AppError.js'
import { auditLogger } from '../../../audit/services/AuditLoggerService.js'
import type { CreateStockMovementDto } from '../dtos/create-stock-movement.dto.js'
import type { StockMovementResponseDto } from '../dtos/stock-movement-response.dto.js'
import { type StockMovementsRepository, stockMovementsRepository } from '../repositories/index.js'
import { calculateStockQuantities } from '../utils/calculate-stock-quantities.js'

export class StockMovementsService {
  constructor(private readonly repository: StockMovementsRepository = stockMovementsRepository) {}

  async create(
    companyId: string,
    userId: string,
    productId: string,
    data: CreateStockMovementDto,
    auditContext?: AuditContext,
  ): Promise<StockMovementResponseDto> {
    const movement = await this.repository.runInTransaction(async (tx) => {
      const product = await this.repository.findProductForMovement(companyId, productId, tx)

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

      await this.repository.updateProductQuantity(product.id, newQuantity, tx)

      const createdMovement = await this.repository.createMovement(
        {
          companyId,
          productId: product.id,
          userId,
          type: movementType,
          quantity: movementQuantity,
          previousQuantity,
          newQuantity,
          reason: data.reason ?? null,
        },
        tx,
      )

      const response = this.toResponse(createdMovement)

      await auditLogger.log({
        companyId,
        userId,
        action: AuditAction.CREATE_STOCK_MOVEMENT,
        entity: 'StockMovement',
        entityId: createdMovement.id,
        oldValue: {
          productId: product.id,
          quantity: previousQuantity,
        },
        newValue: response,
        tx,
        ...auditContext,
      })

      return createdMovement
    })

    await invalidateProductRelatedCache(companyId, productId)

    return this.toResponse(movement)
  }

  private toResponse(movement: StockMovement): StockMovementResponseDto {
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
