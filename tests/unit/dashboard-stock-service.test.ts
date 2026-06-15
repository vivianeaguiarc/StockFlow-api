import { StockMovementType } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DashboardService } from '../../src/modules/dashboard/services/DashboardService.js'
import { CACHE_LIST_TTL_SECONDS, dashboardStockKey } from '../../src/shared/cache/cache-keys.js'
import { cacheService } from '../../src/shared/cache/CacheService.js'
import { prisma } from '../../src/shared/database/prisma.js'

vi.mock('../../src/shared/cache/CacheService.js', () => ({
  cacheService: {
    getOrSet: vi.fn((_key: string, fetcher: () => Promise<unknown>) => fetcher()),
  },
}))

vi.mock('../../src/shared/database/prisma.js', () => ({
  prisma: {
    product: {
      count: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
      fields: { minimumStock: 'minimum_stock' },
    },
    stockMovement: {
      findMany: vi.fn(),
    },
  },
}))

describe('DashboardService.getStock', () => {
  const service = new DashboardService()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns stock metrics with recent movements', async () => {
    vi.mocked(prisma.product.count)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
    vi.mocked(prisma.product.aggregate).mockResolvedValue({
      _count: { _all: 3 },
      _avg: {},
      _sum: { quantity: 25 },
      _min: {},
      _max: {},
    })
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { price: 10, quantity: 10 },
      { price: 5.5, quantity: 3 },
    ] as never)
    vi.mocked(prisma.stockMovement.findMany).mockResolvedValue([
      {
        id: 'movement-1',
        type: StockMovementType.IN,
        quantity: 5,
        previousQuantity: 10,
        newQuantity: 15,
        createdAt: new Date('2026-06-01T12:00:00.000Z'),
        product: { id: 'product-1', name: 'Notebook' },
        user: { id: 'user-1', email: 'admin@test.com' },
      },
    ] as never)

    const result = await service.getStock('company-1')

    expect(result).toEqual({
      totalProducts: 3,
      activeProducts: 2,
      inactiveProducts: 1,
      lowStockProducts: 1,
      totalStockQuantity: 25,
      totalInventoryValue: 116.5,
      recentMovements: [
        {
          id: 'movement-1',
          productId: 'product-1',
          productName: 'Notebook',
          type: StockMovementType.IN,
          quantity: 5,
          previousQuantity: 10,
          newQuantity: 15,
          userId: 'user-1',
          userEmail: 'admin@test.com',
          createdAt: new Date('2026-06-01T12:00:00.000Z'),
        },
      ],
    })
    expect(prisma.stockMovement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: 'company-1' },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    )
  })

  it('uses dashboard stock cache key with 60 second ttl', async () => {
    vi.mocked(prisma.product.count).mockResolvedValue(0)
    vi.mocked(prisma.product.aggregate).mockResolvedValue({
      _count: { _all: 0 },
      _avg: {},
      _sum: { quantity: null },
      _min: {},
      _max: {},
    })
    vi.mocked(prisma.product.findMany).mockResolvedValue([])
    vi.mocked(prisma.stockMovement.findMany).mockResolvedValue([])

    await service.getStock('company-1')

    expect(cacheService.getOrSet).toHaveBeenCalledWith(
      dashboardStockKey('company-1'),
      expect.any(Function),
      CACHE_LIST_TTL_SECONDS,
    )
  })
})
