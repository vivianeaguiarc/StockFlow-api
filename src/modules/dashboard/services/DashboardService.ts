import { InventoryMovementType, ProductStatus } from '@prisma/client'

import {
  dashboardLowStockProductsKey,
  dashboardRecentMovementsKey,
  dashboardSummaryKey,
} from '../../../shared/cache/cache-keys.js'
import { cacheService } from '../../../shared/cache/CacheService.js'
import { prisma } from '../../../shared/database/prisma.js'
import type {
  DashboardLowStockProductDto,
  DashboardRecentMovementDto,
  DashboardSummaryDto,
} from '../dtos/dashboard-response.dto.js'

function getUtcTodayRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  )
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999),
  )

  return { start, end }
}

export class DashboardService {
  async getSummary(companyId: string): Promise<DashboardSummaryDto> {
    return cacheService.getOrSet(dashboardSummaryKey(companyId), () => this.fetchSummary(companyId))
  }

  async getLowStockProducts(companyId: string): Promise<DashboardLowStockProductDto[]> {
    return cacheService.getOrSet(dashboardLowStockProductsKey(companyId), () =>
      this.fetchLowStockProducts(companyId),
    )
  }

  async getRecentMovements(
    companyId: string,
    limit: number,
  ): Promise<DashboardRecentMovementDto[]> {
    return cacheService.getOrSet(dashboardRecentMovementsKey(companyId, limit), () =>
      this.fetchRecentMovements(companyId, limit),
    )
  }

  private async fetchSummary(companyId: string): Promise<DashboardSummaryDto> {
    const { start, end } = getUtcTodayRange()
    const activeProductWhere = {
      companyId,
      deletedAt: null,
      status: ProductStatus.ACTIVE,
    }
    const inactiveProductWhere = {
      companyId,
      deletedAt: null,
      status: ProductStatus.INACTIVE,
    }
    const lowStockWhere = {
      companyId,
      deletedAt: null,
      quantity: {
        lte: prisma.product.fields.minimumStock,
      },
    }
    const todayMovementWhere = {
      companyId,
      createdAt: {
        gte: start,
        lte: end,
      },
    }

    const [
      totalUsers,
      totalCategories,
      totalSuppliers,
      totalProducts,
      activeProducts,
      inactiveProducts,
      lowStockProducts,
      totalInventoryMovements,
      entriesToday,
      exitsToday,
      adjustmentsToday,
    ] = await Promise.all([
      prisma.user.count({
        where: { companyId, deletedAt: null },
      }),
      prisma.category.count({
        where: { companyId, deletedAt: null },
      }),
      prisma.supplier.count({
        where: { companyId, deletedAt: null },
      }),
      prisma.product.count({
        where: { companyId, deletedAt: null },
      }),
      prisma.product.count({ where: activeProductWhere }),
      prisma.product.count({ where: inactiveProductWhere }),
      prisma.product.count({ where: lowStockWhere }),
      prisma.inventoryMovement.count({ where: { companyId } }),
      prisma.inventoryMovement.count({
        where: { ...todayMovementWhere, type: InventoryMovementType.ENTRY },
      }),
      prisma.inventoryMovement.count({
        where: { ...todayMovementWhere, type: InventoryMovementType.EXIT },
      }),
      prisma.inventoryMovement.count({
        where: { ...todayMovementWhere, type: InventoryMovementType.ADJUSTMENT },
      }),
    ])

    return {
      totalUsers,
      totalCategories,
      totalSuppliers,
      totalProducts,
      activeProducts,
      inactiveProducts,
      lowStockProducts,
      totalInventoryMovements,
      entriesToday,
      exitsToday,
      adjustmentsToday,
    }
  }

  private async fetchLowStockProducts(companyId: string): Promise<DashboardLowStockProductDto[]> {
    const products = await prisma.product.findMany({
      where: {
        companyId,
        deletedAt: null,
        quantity: {
          lte: prisma.product.fields.minimumStock,
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        minimumStock: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            tradeName: true,
            corporateName: true,
          },
        },
      },
      orderBy: [{ quantity: 'asc' }, { name: 'asc' }],
    })

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      quantity: product.quantity,
      minimumStock: product.minimumStock,
      category: product.category,
      supplier: {
        id: product.supplier.id,
        name: product.supplier.tradeName || product.supplier.corporateName,
      },
    }))
  }

  private async fetchRecentMovements(
    companyId: string,
    limit: number,
  ): Promise<DashboardRecentMovementDto[]> {
    const movements = await prisma.inventoryMovement.findMany({
      where: { companyId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        quantity: true,
        previousQuantity: true,
        newQuantity: true,
        reason: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return movements
  }
}
