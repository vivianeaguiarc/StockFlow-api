import { StockMovementType } from '@prisma/client'

import {
  CACHE_LIST_TTL_SECONDS,
  dashboardLowStockProductsKey,
  dashboardRecentMovementsKey,
  dashboardStockKey,
  dashboardSummaryKey,
} from '../../../shared/cache/cache-keys.js'
import { cacheService } from '../../../shared/cache/CacheService.js'
import { prisma } from '../../../shared/database/prisma.js'
import type {
  DashboardLowStockProductDto,
  DashboardRecentMovementDto,
  DashboardSummaryDto,
  RecentStockMovementDto,
  StockDashboardDto,
} from '../dtos/dashboard-response.dto.js'

const STOCK_DASHBOARD_RECENT_MOVEMENTS_LIMIT = 5

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

  async getStock(companyId: string): Promise<StockDashboardDto> {
    return cacheService.getOrSet(
      dashboardStockKey(companyId),
      () => this.fetchStock(companyId),
      CACHE_LIST_TTL_SECONDS,
    )
  }

  private async fetchStock(companyId: string): Promise<StockDashboardDto> {
    const baseProductWhere = {
      companyId,
      deletedAt: null,
    }
    const activeProductWhere = {
      ...baseProductWhere,
      active: true,
    }
    const inactiveProductWhere = {
      ...baseProductWhere,
      active: false,
    }
    const lowStockWhere = {
      ...activeProductWhere,
      quantity: {
        lte: prisma.product.fields.minimumStock,
      },
    }

    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      lowStockProducts,
      quantityAggregate,
      inventoryProducts,
      recentMovements,
    ] = await Promise.all([
      prisma.product.count({ where: baseProductWhere }),
      prisma.product.count({ where: activeProductWhere }),
      prisma.product.count({ where: inactiveProductWhere }),
      prisma.product.count({ where: lowStockWhere }),
      prisma.product.aggregate({
        where: baseProductWhere,
        _sum: { quantity: true },
      }),
      prisma.product.findMany({
        where: baseProductWhere,
        select: { price: true, quantity: true },
      }),
      this.fetchStockRecentMovements(companyId),
    ])

    const totalInventoryValue = inventoryProducts.reduce(
      (total, product) => total + Number(product.price) * product.quantity,
      0,
    )

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      lowStockProducts,
      totalStockQuantity: quantityAggregate._sum.quantity ?? 0,
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      recentMovements,
    }
  }

  private async fetchStockRecentMovements(companyId: string): Promise<RecentStockMovementDto[]> {
    const movements = await prisma.stockMovement.findMany({
      where: { companyId },
      take: STOCK_DASHBOARD_RECENT_MOVEMENTS_LIMIT,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        quantity: true,
        previousQuantity: true,
        newQuantity: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    return movements.map((movement) => ({
      id: movement.id,
      productId: movement.product.id,
      productName: movement.product.name,
      type: movement.type,
      quantity: movement.quantity,
      previousQuantity: movement.previousQuantity,
      newQuantity: movement.newQuantity,
      userId: movement.user.id,
      userEmail: movement.user.email,
      createdAt: movement.createdAt,
    }))
  }

  private async fetchSummary(companyId: string): Promise<DashboardSummaryDto> {
    const { start, end } = getUtcTodayRange()
    const activeProductWhere = {
      companyId,
      deletedAt: null,
      active: true,
    }
    const inactiveProductWhere = {
      companyId,
      deletedAt: null,
      active: false,
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
      prisma.stockMovement.count({ where: { companyId } }),
      prisma.stockMovement.count({
        where: { ...todayMovementWhere, type: StockMovementType.IN },
      }),
      prisma.stockMovement.count({
        where: { ...todayMovementWhere, type: StockMovementType.OUT },
      }),
      prisma.stockMovement.count({
        where: { ...todayMovementWhere, type: StockMovementType.ADJUSTMENT },
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
      supplier: product.supplier
        ? {
            id: product.supplier.id,
            name: product.supplier.tradeName || product.supplier.corporateName,
          }
        : null,
    }))
  }

  private async fetchRecentMovements(
    companyId: string,
    limit: number,
  ): Promise<DashboardRecentMovementDto[]> {
    const movements = await prisma.stockMovement.findMany({
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
