import type { Prisma } from '@prisma/client'

import { prisma } from '../../../../shared/database/prisma.js'
import type {
  CreateStockMovementRecord,
  StockMovementsRepository,
} from './stock-movements.repository.js'

export class PrismaStockMovementsRepository implements StockMovementsRepository {
  findProductForMovement(companyId: string, productId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma
    return client.product.findFirst({
      where: {
        id: productId,
        companyId,
        deletedAt: null,
      },
      select: {
        id: true,
        quantity: true,
      },
    })
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
}
