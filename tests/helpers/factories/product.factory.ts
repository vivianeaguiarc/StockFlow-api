import { Prisma, type Product } from '@prisma/client'

export function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    companyId: 'company-1',
    categoryId: null,
    supplierId: null,
    name: 'Notebook',
    description: null,
    sku: 'NB-001',
    barcode: null,
    price: new Prisma.Decimal('29.90'),
    quantity: 10,
    minimumStock: 2,
    active: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  }
}
