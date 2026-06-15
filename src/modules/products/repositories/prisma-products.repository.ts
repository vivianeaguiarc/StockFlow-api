import type { Prisma } from '@prisma/client'

import { prisma } from '../../../shared/database/prisma.js'
import type { CreateProductRecord, ProductsRepository } from './products.repository.js'

export class PrismaProductsRepository implements ProductsRepository {
  create(data: CreateProductRecord) {
    return prisma.product.create({ data })
  }

  findActiveInCompany(companyId: string, productId: string) {
    return prisma.product.findFirst({
      where: {
        id: productId,
        companyId,
        deletedAt: null,
      },
    })
  }

  findMany(
    where: Prisma.ProductWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.ProductOrderByWithRelationInput,
  ) {
    return prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
    })
  }

  count(where: Prisma.ProductWhereInput) {
    return prisma.product.count({ where })
  }

  update(productId: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id: productId },
      data,
    })
  }

  softDelete(productId: string, deletedAt: Date) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        deletedAt,
        active: false,
      },
    })
  }

  findCategoryInCompany(companyId: string, categoryId: string) {
    return prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId,
        deletedAt: null,
      },
      select: { id: true },
    })
  }

  findSupplierInCompany(companyId: string, supplierId: string) {
    return prisma.supplier.findFirst({
      where: {
        id: supplierId,
        companyId,
        deletedAt: null,
      },
      select: { id: true },
    })
  }
}
