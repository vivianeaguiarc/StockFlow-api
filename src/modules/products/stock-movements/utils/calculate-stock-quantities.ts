import { StockMovementType } from '@prisma/client'

import { AppError } from '../../../../shared/errors/AppError.js'

export function calculateStockQuantities(
  type: StockMovementType,
  quantity: number,
  previousQuantity: number,
): { newQuantity: number; movementQuantity: number } {
  switch (type) {
    case StockMovementType.IN:
      return {
        newQuantity: previousQuantity + quantity,
        movementQuantity: quantity,
      }

    case StockMovementType.OUT:
      if (previousQuantity < quantity) {
        throw new AppError('Insufficient stock', 409)
      }

      return {
        newQuantity: previousQuantity - quantity,
        movementQuantity: quantity,
      }

    case StockMovementType.ADJUSTMENT:
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
