import type { StockMovementType } from '@prisma/client'
import { AuditAction, type StockMovement } from '@prisma/client'

import type { AuditContext } from '../../../../shared/audit/audit-context.js'
import { invalidateProductRelatedCache } from '../../../../shared/cache/cache-invalidation.js'
import { AppError } from '../../../../shared/errors/AppError.js'
import { executePaginatedQuery } from '../../../../shared/utils/pagination.js'
import { auditLogger } from '../../../audit/services/AuditLoggerService.js'
import type { CreateStockMovementDto } from '../dtos/create-stock-movement.dto.js'
import type { ListStockMovementsQuery } from '../dtos/list-stock-movements-query.dto.js'
import type {
  PaginatedStockMovementsResponseDto,
  StockMovementListItemDto,
  StockMovementResponseDto,
} from '../dtos/stock-movement-response.dto.js'
import {
  type StockMovementsRepository,
  stockMovementsRepository,
  type StockMovementWithRelations,
} from '../repositories/index.js'
import { buildStockMovementsListWhere } from '../utils/build-stock-movements-list-where.js'
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

  async list(
    companyId: string,
    query: ListStockMovementsQuery,
    routeProductId?: string,
  ): Promise<PaginatedStockMovementsResponseDto> {
    const productIdToValidate = routeProductId ?? query.productId

    if (productIdToValidate) {
      const exists = await this.repository.productExistsInCompany(companyId, productIdToValidate)

      if (!exists) {
        throw new AppError('Product not found', 404)
      }
    }

    const where = buildStockMovementsListWhere(companyId, query, routeProductId)

    const result = await executePaginatedQuery({
      page: query.page,
      pageSize: query.limit,
      findMany: (skip, take) => this.repository.findMany(where, skip, take),
      count: () => this.repository.count(where),
    })

    return {
      data: result.data.map((movement) => this.toListItem(movement)),
      pagination: result.pagination,
    }
  }

  private toListItem(movement: StockMovementWithRelations): StockMovementListItemDto {
    return {
      id: movement.id,
      productId: movement.productId,
      productName: movement.product.name,
      userId: movement.userId,
      userName: `${movement.user.firstName} ${movement.user.lastName}`.trim(),
      userEmail: movement.user.email,
      type: movement.type,
      quantity: movement.quantity,
      previousQuantity: movement.previousQuantity,
      newQuantity: movement.newQuantity,
      reason: movement.reason,
      createdAt: movement.createdAt,
    }
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
