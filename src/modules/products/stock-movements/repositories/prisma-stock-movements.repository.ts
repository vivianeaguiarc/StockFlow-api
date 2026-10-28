import type { Prisma } from '@prisma/client'

import { prisma } from '../../../../shared/database/prisma.js'
import type {
  CreateStockMovementRecord,
  StockMovementsRepository,
  StockMovementWithRelations,
} from './stock-movements.repository.js'

const stockMovementListInclude = {
  product: {
    select: {
      name: true,
    },
  },
  user: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  },
} as const

export class PrismaStockMovementsRepository implements StockMovementsRepository {
  /**
   * Reads the product row with `FOR UPDATE`, holding a row lock until the transaction
   * ends. Concurrent movements on the same product wait here and then read the
   * committed quantity, so read-modify-write cannot lose updates.
   */
  async lockProductForMovement(companyId: string, productId: string, tx: Prisma.TransactionClient) {
    const rows = await tx.$queryRaw<{ id: string; quantity: number }[]>`
      SELECT id, quantity
      FROM products
      WHERE id = ${productId}
        AND company_id = ${companyId}
        AND deleted_at IS NULL
      FOR UPDATE
    `

    return rows[0] ?? null
  }

  createMovement(data: CreateStockMovementRecord, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma
    return client.stockMovement.create({ data })
  }

  async updateProductQuantity(productId: string, quantity: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma
    await client.product.update({
      where: { id: productId },
      data: { quantity },
    })
  }

  runInTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(fn)
  }

  findMany(where: Prisma.StockMovementWhereInput, skip: number, take: number) {
    return prisma.stockMovement.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: stockMovementListInclude,
    }) as Promise<StockMovementWithRelations[]>
  }

  count(where: Prisma.StockMovementWhereInput) {
    return prisma.stockMovement.count({ where })
  }

  productExistsInCompany(companyId: string, productId: string) {
    return prisma.product
      .findFirst({
        where: {
          id: productId,
          companyId,
          deletedAt: null,
        },
        select: { id: true },
      })
      .then((product) => product !== null)
  }
}
