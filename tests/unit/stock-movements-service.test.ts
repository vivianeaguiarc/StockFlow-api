import { AuditAction, StockMovementType } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auditLogger } from '../../src/modules/audit/services/AuditLoggerService.js'
import { StockMovementsService } from '../../src/modules/products/stock-movements/services/StockMovementsService.js'
import { invalidateProductRelatedCache } from '../../src/shared/cache/cache-invalidation.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { buildProduct } from '../helpers/factories/product.factory.js'
import { createStockMovementsRepositoryMock } from '../helpers/mocks/stock-movements-repository.mock.js'

vi.mock('../../src/modules/audit/services/AuditLoggerService.js', () => ({
  auditLogger: {
    log: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('../../src/shared/cache/cache-invalidation.js', () => ({
  invalidateProductRelatedCache: vi.fn().mockResolvedValue(undefined),
}))

describe('StockMovementsService', () => {
  const repository = createStockMovementsRepositoryMock()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(repository.runInTransaction).mockImplementation(async (fn) => fn({} as never))
  })

  it('creates IN movement and records CREATE_STOCK_MOVEMENT audit log', async () => {
    const product = buildProduct({ id: 'product-1', quantity: 10 })

    vi.mocked(repository.findProductForMovement).mockResolvedValue({
      id: product.id,
      quantity: product.quantity,
    })
    vi.mocked(repository.createMovement).mockResolvedValue({
      id: 'movement-1',
      companyId: 'company-1',
      productId: 'product-1',
      userId: 'user-1',
      type: StockMovementType.IN,
      quantity: 5,
      previousQuantity: 10,
      newQuantity: 15,
      reason: 'Restock',
      createdAt: new Date(),
    })

    const service = new StockMovementsService(repository)
    const result = await service.create('company-1', 'user-1', 'product-1', {
      type: 'IN',
      quantity: 5,
      reason: 'Restock',
    })

    expect(result.newQuantity).toBe(15)
    expect(repository.updateProductQuantity).toHaveBeenCalledWith(
      'product-1',
      15,
      expect.anything(),
    )
    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.CREATE_STOCK_MOVEMENT,
        entity: 'StockMovement',
      }),
    )
    expect(invalidateProductRelatedCache).toHaveBeenCalledWith('company-1', 'product-1')
  })

  it('throws 404 when product is not found', async () => {
    vi.mocked(repository.findProductForMovement).mockResolvedValue(null)

    const service = new StockMovementsService(repository)

    await expect(
      service.create('company-1', 'user-1', 'missing', { type: 'IN', quantity: 1 }),
    ).rejects.toMatchObject({
      message: 'Product not found',
      statusCode: 404,
    } satisfies Partial<AppError>)
  })

  it('throws 409 when OUT exceeds available stock', async () => {
    vi.mocked(repository.findProductForMovement).mockResolvedValue({ id: 'product-1', quantity: 2 })

    const service = new StockMovementsService(repository)

    await expect(
      service.create('company-1', 'user-1', 'product-1', { type: 'OUT', quantity: 5 }),
    ).rejects.toMatchObject({
      message: 'Insufficient stock',
      statusCode: 409,
    } satisfies Partial<AppError>)
  })

  it('lists movements with pagination metadata', async () => {
    vi.mocked(repository.productExistsInCompany).mockResolvedValue(true)
    vi.mocked(repository.findMany).mockResolvedValue([
      {
        id: 'movement-1',
        companyId: 'company-1',
        productId: 'product-1',
        userId: 'user-1',
        type: StockMovementType.IN,
        quantity: 5,
        previousQuantity: 10,
        newQuantity: 15,
        reason: 'Restock',
        createdAt: new Date('2026-06-01T12:00:00.000Z'),
        product: { name: 'Notebook' },
        user: { firstName: 'Ana', lastName: 'Silva', email: 'ana@test.com' },
      },
    ])
    vi.mocked(repository.count).mockResolvedValue(1)

    const service = new StockMovementsService(repository)
    const result = await service.list('company-1', { page: 1, limit: 10 })

    expect(result.data[0]).toMatchObject({
      productName: 'Notebook',
      userName: 'Ana Silva',
      userEmail: 'ana@test.com',
      type: 'IN',
    })
    expect(result.pagination).toMatchObject({ page: 1, limit: 10, totalItems: 1 })
  })

  it('throws 404 when filtered productId does not exist', async () => {
    vi.mocked(repository.productExistsInCompany).mockResolvedValue(false)

    const service = new StockMovementsService(repository)

    await expect(
      service.list('company-1', { page: 1, limit: 10, productId: 'missing' }),
    ).rejects.toMatchObject({
      message: 'Product not found',
      statusCode: 404,
    } satisfies Partial<AppError>)
  })
})
