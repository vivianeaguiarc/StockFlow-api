import type { Prisma, Product } from '@prisma/client'

export type CreateProductRecord = {
  companyId: string
  categoryId?: string | null
  supplierId?: string | null
  name: string
  description?: string | null
  sku: string
  barcode?: string | null
  price: Prisma.Decimal | number
  quantity: number
  minimumStock: number
  active: boolean
}

export interface ProductsRepository {
  create(data: CreateProductRecord): Promise<Product>
  findActiveInCompany(companyId: string, productId: string): Promise<Product | null>
  findMany(
    where: Prisma.ProductWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[],
  ): Promise<Product[]>
  count(where: Prisma.ProductWhereInput): Promise<number>
  update(productId: string, data: Prisma.ProductUpdateInput): Promise<Product>
  softDelete(productId: string, deletedAt: Date): Promise<Product>
  findCategoryInCompany(companyId: string, categoryId: string): Promise<{ id: string } | null>
  findSupplierInCompany(companyId: string, supplierId: string): Promise<{ id: string } | null>
}
