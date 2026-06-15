import { z } from 'zod'

const nonNegativeInt = z.coerce.number().int().nonnegative()

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  description: z.string().trim().optional(),
  sku: z.string().trim().min(1, 'SKU is required'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  quantity: nonNegativeInt.default(0),
  minimumStock: nonNegativeInt.default(0),
  active: z.boolean().default(true),
  categoryId: z.string().trim().min(1).optional(),
  supplierId: z.string().trim().min(1).optional(),
  barcode: z.string().trim().optional(),
})

export type CreateProductDto = z.infer<typeof createProductSchema>
