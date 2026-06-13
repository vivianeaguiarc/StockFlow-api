import { z } from 'zod'

const nonNegativeNumber = z.coerce.number().nonnegative()
const nonNegativeInt = z.coerce.number().int().nonnegative()

export const createProductSchema = z.object({
  categoryId: z.string().trim().min(1, 'Category is required'),
  supplierId: z.string().trim().min(1, 'Supplier is required'),
  name: z.string().trim().min(1, 'Product name is required'),
  description: z.string().trim().optional(),
  sku: z.string().trim().min(1, 'SKU is required'),
  barcode: z.string().trim().optional(),
  costPrice: nonNegativeNumber,
  salePrice: nonNegativeNumber,
  quantity: nonNegativeInt.default(0),
  minimumStock: nonNegativeInt.default(0),
})

export type CreateProductDto = z.infer<typeof createProductSchema>
