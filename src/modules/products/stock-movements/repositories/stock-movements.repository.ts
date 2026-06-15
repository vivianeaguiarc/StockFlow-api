import type { Prisma, StockMovement } from '@prisma/client'

export type StockMovementWithRelations = StockMovement & {
  product: {
    name: string
  }
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

export type CreateStockMovementRecord = {
  companyId: string
  productId: string
  userId: string
  type: StockMovement['type']
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason?: string | null
}

export interface StockMovementsRepository {
  findProductForMovement(
    companyId: string,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string; quantity: number } | null>
  createMovement(
    data: CreateStockMovementRecord,
    tx?: Prisma.TransactionClient,
  ): Promise<StockMovement>
  updateProductQuantity(
    productId: string,
    quantity: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void>
  runInTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>
  findMany(
    where: Prisma.StockMovementWhereInput,
    skip: number,
    take: number,
  ): Promise<StockMovementWithRelations[]>
  count(where: Prisma.StockMovementWhereInput): Promise<number>
  productExistsInCompany(companyId: string, productId: string): Promise<boolean>
}
