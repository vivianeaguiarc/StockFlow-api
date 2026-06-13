import { Prisma, type Product, ProductStatus } from '@prisma/client'

import { prisma } from '../../../shared/database/prisma.js'
import { AppError } from '../../../shared/errors/AppError.js'
import {
  buildPaginationMeta,
  getPaginationOffset,
  type PaginationParams,
} from '../../../shared/utils/pagination.js'
import type { CreateProductDto } from '../dtos/create-product.dto.js'
import type {
  PaginatedProductsResponseDto,
  ProductResponseDto,
} from '../dtos/product-response.dto.js'
import type { UpdateProductDto } from '../dtos/update-product.dto.js'

export class ProductsService {
  async create(companyId: string, data: CreateProductDto): Promise<ProductResponseDto> {
    await this.validateCategory(companyId, data.categoryId)
    await this.validateSupplier(companyId, data.supplierId)

    try {
      const product = await prisma.product.create({
        data: {
          companyId,
          categoryId: data.categoryId,
          supplierId: data.supplierId,
          name: data.name,
          description: data.description ?? null,
          sku: data.sku,
          barcode: data.barcode ?? null,
          costPrice: data.costPrice,
          salePrice: data.salePrice,
          quantity: data.quantity,
          minimumStock: data.minimumStock,
        },
      })

      return this.toResponse(product)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(this.getDuplicateMessage(error), 409)
      }

      throw error
    }
  }

  async list(
    companyId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedProductsResponseDto> {
    const { page, limit } = pagination
    const offset = getPaginationOffset(page, limit)

    const where = {
      companyId,
      deletedAt: null,
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ])

    return {
      data: products.map((product) => this.toResponse(product)),
      meta: buildPaginationMeta(page, limit, total),
    }
  }

  async getById(companyId: string, productId: string): Promise<ProductResponseDto> {
    const product = await this.findActiveProductInCompany(companyId, productId)
    return this.toResponse(product)
  }

  async update(
    companyId: string,
    productId: string,
    data: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    await this.findActiveProductInCompany(companyId, productId)

    if (data.categoryId !== undefined) {
      await this.validateCategory(companyId, data.categoryId)
    }

    if (data.supplierId !== undefined) {
      await this.validateSupplier(companyId, data.supplierId)
    }

    try {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: {
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.supplierId !== undefined && { supplierId: data.supplierId }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.sku !== undefined && { sku: data.sku }),
          ...(data.barcode !== undefined && { barcode: data.barcode }),
          ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
          ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
          ...(data.quantity !== undefined && { quantity: data.quantity }),
          ...(data.minimumStock !== undefined && { minimumStock: data.minimumStock }),
          ...(data.status !== undefined && { status: data.status }),
        },
      })

      return this.toResponse(updated)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(this.getDuplicateMessage(error), 409)
      }

      throw error
    }
  }

  async delete(companyId: string, productId: string): Promise<void> {
    await this.findActiveProductInCompany(companyId, productId)

    await prisma.product.update({
      where: { id: productId },
      data: {
        deletedAt: new Date(),
        status: ProductStatus.INACTIVE,
      },
    })
  }

  private async validateCategory(companyId: string, categoryId: string): Promise<void> {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId,
        deletedAt: null,
      },
    })

    if (!category) {
      throw new AppError('Category not found', 404)
    }
  }

  private async validateSupplier(companyId: string, supplierId: string): Promise<void> {
    const supplier = await prisma.supplier.findFirst({
      where: {
        id: supplierId,
        companyId,
        deletedAt: null,
      },
    })

    if (!supplier) {
      throw new AppError('Supplier not found', 404)
    }
  }

  private async findActiveProductInCompany(companyId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        companyId,
        deletedAt: null,
      },
    })

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

  private toResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      companyId: product.companyId,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      name: product.name,
      description: product.description,
      sku: product.sku,
      barcode: product.barcode,
      costPrice: Number(product.costPrice),
      salePrice: Number(product.salePrice),
      quantity: product.quantity,
      minimumStock: product.minimumStock,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }
}
