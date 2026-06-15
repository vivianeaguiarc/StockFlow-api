import { z } from 'zod'

const nonNegativeInt = z.coerce.number().int().nonnegative()

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1, 'Product name is required').optional(),
    description: z.string().trim().optional(),
    sku: z.string().trim().min(1, 'SKU is required').optional(),
    price: z.coerce.number().positive('Price must be greater than 0').optional(),
    quantity: nonNegativeInt.optional(),
    minimumStock: nonNegativeInt.optional(),
    active: z.boolean().optional(),
    categoryId: z.string().trim().min(1).nullable().optional(),
    supplierId: z.string().trim().min(1).nullable().optional(),
    barcode: z.string().trim().nullable().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.sku !== undefined ||
      data.price !== undefined ||
      data.quantity !== undefined ||
      data.minimumStock !== undefined ||
      data.active !== undefined ||
      data.categoryId !== undefined ||
      data.supplierId !== undefined ||
      data.barcode !== undefined,
    { message: 'At least one field must be provided' },
  )

export type UpdateProductDto = z.infer<typeof updateProductSchema>
