import { StockMovementType } from '@prisma/client'
import { describe, expect, it } from 'vitest'

import { AppError } from '../../../shared/errors/AppError.js'
import { calculateStockQuantities } from '../../src/modules/products/stock-movements/utils/calculate-stock-quantities.js'

describe('calculateStockQuantities', () => {
  it('adds quantity on IN movement', () => {
    expect(calculateStockQuantities(StockMovementType.IN, 5, 10)).toEqual({
      newQuantity: 15,
      movementQuantity: 5,
    })
  })

  it('subtracts quantity on OUT movement', () => {
    expect(calculateStockQuantities(StockMovementType.OUT, 3, 10)).toEqual({
      newQuantity: 7,
      movementQuantity: 3,
    })
  })

  it('throws 409 when OUT exceeds available stock', () => {
    expect(() => calculateStockQuantities(StockMovementType.OUT, 10, 3)).toThrow(
      expect.objectContaining({
        message: 'Insufficient stock',
        statusCode: 409,
      } satisfies Partial<AppError>),
    )
  })

  it('sets final quantity on ADJUSTMENT movement', () => {
    expect(calculateStockQuantities(StockMovementType.ADJUSTMENT, 25, 10)).toEqual({
      newQuantity: 25,
      movementQuantity: 25,
    })
  })
})
