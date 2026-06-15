import { AuditAction, Prisma, type Product } from '@prisma/client'

import type { AuditContext } from '../../../shared/audit/audit-context.js'
import { invalidateProductRelatedCache } from '../../../shared/cache/cache-invalidation.js'
import {
  CACHE_DETAIL_TTL_SECONDS,
  CACHE_LIST_TTL_SECONDS,
  hashProductsListQuery,
  hashProductsLowStockQuery,
  productsByIdKey,
  productsListKey,
  productsLowStockKey,
} from '../../../shared/cache/cache-keys.js'
import { cacheService } from '../../../shared/cache/CacheService.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { buildOrderBy, executePaginatedQuery } from '../../../shared/utils/pagination.js'
import { auditLogger } from '../../audit/services/AuditLoggerService.js'
import type { CreateProductDto } from '../dtos/create-product.dto.js'
import type { ListLowStockProductsQuery } from '../dtos/list-low-stock-products-query.dto.js'
import type { ListProductsQuery } from '../dtos/list-products-query.dto.js'
import type {
  LowStockProductResponseDto,
  PaginatedLowStockProductsResponseDto,
} from '../dtos/low-stock-product-response.dto.js'
import type {
  PaginatedProductsResponseDto,
  ProductResponseDto,
} from '../dtos/product-response.dto.js'
import type { UpdateProductDto } from '../dtos/update-product.dto.js'
import { type ProductsRepository, productsRepository } from '../repositories/index.js'
import {
  buildLowStockProductsWhere,
  lowStockProductsOrderBy,
} from '../utils/build-low-stock-products-where.js'
import { buildProductsListWhere } from '../utils/build-products-list-where.js'

export class ProductsService {
  constructor(private readonly repository: ProductsRepository = productsRepository) {}

  async create(
    companyId: string,
    actorUserId: string,
    data: CreateProductDto,
    auditContext?: AuditContext,
  ): Promise<ProductResponseDto> {
    if (data.categoryId) {
      await this.validateCategory(companyId, data.categoryId)
    }

    if (data.supplierId) {
      await this.validateSupplier(companyId, data.supplierId)
    }

    try {
      const product = await this.repository.create({
        companyId,
        categoryId: data.categoryId ?? null,
        supplierId: data.supplierId ?? null,
        name: data.name,
        description: data.description ?? null,
        sku: data.sku,
        barcode: data.barcode ?? null,
        price: data.price,
        quantity: data.quantity,
        minimumStock: data.minimumStock,
        active: data.active,
      })

      const response = this.toResponse(product)

      await auditLogger.log({
        companyId,
        userId: actorUserId,
        action: AuditAction.CREATE_PRODUCT,
        entity: 'Product',
        entityId: product.id,
        newValue: response,
        ...auditContext,
      })

      await invalidateProductRelatedCache(companyId)

      return response
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(this.getDuplicateMessage(error), 409)
      }

      throw error
    }
  }

  async list(companyId: string, query: ListProductsQuery): Promise<PaginatedProductsResponseDto> {
    const cacheKey = productsListKey(companyId, hashProductsListQuery(query))

    return cacheService.getOrSet(
      cacheKey,
      () => this.fetchProductList(companyId, query),
      CACHE_LIST_TTL_SECONDS,
    )
  }

  private async fetchProductList(
    companyId: string,
    query: ListProductsQuery,
  ): Promise<PaginatedProductsResponseDto> {
    const { page, limit, sortBy, sortOrder } = query
    const orderBy = buildOrderBy(
      sortBy,
      sortOrder,
      ['name', 'sku', 'quantity', 'createdAt', 'price'] as const,
      'name',
    )
    const where = buildProductsListWhere(companyId, query)

    const result = await executePaginatedQuery({
      page,
      pageSize: limit,
      findMany: (skip, take) => this.repository.findMany(where, skip, take, orderBy),
      count: () => this.repository.count(where),
    })

    return {
      data: result.data.map((product) => this.toResponse(product)),
      pagination: result.pagination,
    }
  }

  async listLowStock(
    companyId: string,
    query: ListLowStockProductsQuery,
  ): Promise<PaginatedLowStockProductsResponseDto> {
    const cacheKey = productsLowStockKey(companyId, hashProductsLowStockQuery(query))

    return cacheService.getOrSet(
      cacheKey,
      () => this.fetchLowStockProducts(companyId, query),
      CACHE_LIST_TTL_SECONDS,
    )
  }

  private async fetchLowStockProducts(
    companyId: string,
    query: ListLowStockProductsQuery,
  ): Promise<PaginatedLowStockProductsResponseDto> {
    const where = buildLowStockProductsWhere(companyId, query)

    const result = await executePaginatedQuery({
      page: query.page,
      pageSize: query.limit,
      findMany: (skip, take) =>
        this.repository.findMany(where, skip, take, lowStockProductsOrderBy),
      count: () => this.repository.count(where),
    })

    return {
      data: result.data.map((product) => this.toLowStockResponse(product)),
      pagination: result.pagination,
    }
  }

  async getById(companyId: string, productId: string): Promise<ProductResponseDto> {
    const cacheKey = productsByIdKey(companyId, productId)

    return cacheService.getOrSet(
      cacheKey,
      () => this.fetchProductById(companyId, productId),
      CACHE_DETAIL_TTL_SECONDS,
    )
  }

  private async fetchProductById(
    companyId: string,
    productId: string,
  ): Promise<ProductResponseDto> {
    const product = await this.findActiveProductInCompany(companyId, productId)
    return this.toResponse(product)
  }

  async update(
    companyId: string,
    actorUserId: string,
    productId: string,
    data: UpdateProductDto,
    auditContext?: AuditContext,
  ): Promise<ProductResponseDto> {
    const product = await this.findActiveProductInCompany(companyId, productId)
    const oldValue = this.toResponse(product)

    if (data.categoryId) {
      await this.validateCategory(companyId, data.categoryId)
    }

    if (data.supplierId) {
      await this.validateSupplier(companyId, data.supplierId)
    }

    try {
      const updated = await this.repository.update(productId, {
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.supplierId !== undefined && { supplierId: data.supplierId }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.barcode !== undefined && { barcode: data.barcode }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.minimumStock !== undefined && { minimumStock: data.minimumStock }),
        ...(data.active !== undefined && { active: data.active }),
      })

      const response = this.toResponse(updated)

      await auditLogger.log({
        companyId,
        userId: actorUserId,
        action: AuditAction.UPDATE_PRODUCT,
        entity: 'Product',
        entityId: productId,
        oldValue,
        newValue: response,
        ...auditContext,
      })

      await invalidateProductRelatedCache(companyId, productId)

      return response
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(this.getDuplicateMessage(error), 409)
      }

      throw error
    }
  }

  async delete(
    companyId: string,
    actorUserId: string,
    productId: string,
    auditContext?: AuditContext,
  ): Promise<void> {
    const product = await this.findActiveProductInCompany(companyId, productId)
    const oldValue = this.toResponse(product)
    const deletedAt = new Date()

    await this.repository.softDelete(productId, deletedAt)

    await auditLogger.log({
      companyId,
      userId: actorUserId,
      action: AuditAction.DELETE_PRODUCT,
      entity: 'Product',
      entityId: productId,
      oldValue,
      newValue: { deletedAt: deletedAt.toISOString(), active: false },
      ...auditContext,
    })

    await invalidateProductRelatedCache(companyId, productId)
  }

  private async validateCategory(companyId: string, categoryId: string): Promise<void> {
    const category = await this.repository.findCategoryInCompany(companyId, categoryId)

    if (!category) {
      throw new AppError('Category not found', 404)
    }
  }

  private async validateSupplier(companyId: string, supplierId: string): Promise<void> {
    const supplier = await this.repository.findSupplierInCompany(companyId, supplierId)

    if (!supplier) {
      throw new AppError('Supplier not found', 404)
    }
  }

  private async findActiveProductInCompany(companyId: string, productId: string) {
    const product = await this.repository.findActiveInCompany(companyId, productId)

    if (!product) {
      throw new AppError('Product not found', 404)
    }

    return product
  }

  private getDuplicateMessage(error: Prisma.PrismaClientKnownRequestError): string {
    const target = error.meta?.['target']

    if (Array.isArray(target) && target.includes('sku')) {
      return 'Product SKU already exists for this company'
    }

    if (Array.isArray(target) && target.includes('barcode')) {
      return 'Product barcode already exists for this company'
    }

    return 'Product already exists for this company'
  }

  private toLowStockResponse(product: Product): LowStockProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      quantity: product.quantity,
      minimumStock: product.minimumStock,
      active: product.active,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }

  private toResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      companyId: product.companyId,
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: Number(product.price),
      quantity: product.quantity,
      minimumStock: product.minimumStock,
      active: product.active,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      barcode: product.barcode,
    }
  }
}
