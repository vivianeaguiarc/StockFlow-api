import { AuditAction, Prisma } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auditLogger } from '../../src/modules/audit/services/AuditLoggerService.js'
import { ProductsService } from '../../src/modules/products/services/ProductsService.js'
import { invalidateProductRelatedCache } from '../../src/shared/cache/cache-invalidation.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { buildProduct } from '../helpers/factories/product.factory.js'
import { createProductsRepositoryMock } from '../helpers/mocks/products-repository.mock.js'

vi.mock('../../src/modules/audit/services/AuditLoggerService.js', () => ({
  auditLogger: {
    log: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('../../src/shared/cache/CacheService.js', () => ({
  cacheService: {
    getOrSet: vi.fn((_key: string, fetcher: () => Promise<unknown>) => fetcher()),
    del: vi.fn().mockResolvedValue(undefined),
    delByPattern: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('../../src/shared/cache/cache-invalidation.js', () => ({
  invalidateProductRelatedCache: vi.fn().mockResolvedValue(undefined),
}))

describe('ProductsService', () => {
  const repository = createProductsRepositoryMock()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a product and records CREATE_PRODUCT audit log', async () => {
    const created = buildProduct({ id: 'product-2', sku: 'NB-002' })
    vi.mocked(repository.create).mockResolvedValue(created)

    const service = new ProductsService(repository)
    const result = await service.create('company-1', 'admin-1', {
      name: 'Notebook',
      sku: 'NB-002',
      price: 29.9,
      quantity: 0,
      minimumStock: 0,
      active: true,
    })

    expect(result.sku).toBe('NB-002')
    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.CREATE_PRODUCT,
        entity: 'Product',
        entityId: 'product-2',
      }),
    )
    expect(invalidateProductRelatedCache).toHaveBeenCalledWith('company-1')
  })

  it('throws 409 when SKU already exists', async () => {
    vi.mocked(repository.create).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.19.3',
        meta: { target: ['company_id', 'sku'] },
      }),
    )

    const service = new ProductsService(repository)

    await expect(
      service.create('company-1', 'admin-1', {
        name: 'Dup',
        sku: 'DUP-001',
        price: 10,
        quantity: 0,
        minimumStock: 0,
        active: true,
      }),
    ).rejects.toMatchObject({
      message: 'Product SKU already exists for this company',
      statusCode: 409,
    } satisfies Partial<AppError>)
  })

  it('lists products with pagination metadata using limit', async () => {
    const products = [buildProduct(), buildProduct({ id: 'product-2', sku: 'NB-002' })]

    vi.mocked(repository.findMany).mockResolvedValue(products)
    vi.mocked(repository.count).mockResolvedValue(2)

    const service = new ProductsService(repository)
    const result = await service.list('company-1', {
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'asc',
    })

    expect(result.data).toHaveLength(2)
    expect(result.pagination).toMatchObject({
      page: 1,
      limit: 10,
      totalItems: 2,
    })
  })

  it('returns product by id', async () => {
    vi.mocked(repository.findActiveInCompany).mockResolvedValue(buildProduct())

    const service = new ProductsService(repository)
    const product = await service.getById('company-1', 'product-1')

    expect(product.id).toBe('product-1')
  })

  it('updates product and records UPDATE_PRODUCT audit log', async () => {
    const existing = buildProduct()
    const updated = buildProduct({ name: 'Updated Notebook' })

    vi.mocked(repository.findActiveInCompany).mockResolvedValue(existing)
    vi.mocked(repository.update).mockResolvedValue(updated)

    const service = new ProductsService(repository)
    const result = await service.update('company-1', 'admin-1', 'product-1', {
      name: 'Updated Notebook',
    })

    expect(result.name).toBe('Updated Notebook')
    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.UPDATE_PRODUCT,
        entityId: 'product-1',
      }),
    )
    expect(invalidateProductRelatedCache).toHaveBeenCalledWith('company-1', 'product-1')
  })

  it('soft deletes product and records DELETE_PRODUCT audit log', async () => {
    const existing = buildProduct()

    vi.mocked(repository.findActiveInCompany).mockResolvedValue(existing)
    vi.mocked(repository.softDelete).mockResolvedValue({
      ...existing,
      active: false,
      deletedAt: new Date(),
    })

    const service = new ProductsService(repository)
    await service.delete('company-1', 'admin-1', 'product-1')

    expect(repository.softDelete).toHaveBeenCalledWith('product-1', expect.any(Date))
    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.DELETE_PRODUCT,
        entityId: 'product-1',
      }),
    )
    expect(invalidateProductRelatedCache).toHaveBeenCalledWith('company-1', 'product-1')
  })
})
