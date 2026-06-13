import { z } from 'zod'

const nonNegativeNumber = z.coerce.number().nonnegative()
const nonNegativeInt = z.coerce.number().int().nonnegative()

export const updateProductSchema = z
  .object({
    categoryId: z.string().trim().min(1, 'Category is required').optional(),
    supplierId: z.string().trim().min(1, 'Supplier is required').optional(),
    name: z.string().trim().min(1, 'Product name is required').optional(),
    description: z.string().trim().optional(),
    sku: z.string().trim().min(1, 'SKU is required').optional(),
    barcode: z.string().trim().optional(),
    costPrice: nonNegativeNumber.optional(),
    salePrice: nonNegativeNumber.optional(),
    quantity: nonNegativeInt.optional(),
    minimumStock: nonNegativeInt.optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine(
    (data) =>
      data.categoryId !== undefined ||
      data.supplierId !== undefined ||
      data.name !== undefined ||
      data.description !== undefined ||
      data.sku !== undefined ||
      data.barcode !== undefined ||
      data.costPrice !== undefined ||
      data.salePrice !== undefined ||
      data.quantity !== undefined ||
      data.minimumStock !== undefined ||
      data.status !== undefined,
    { message: 'At least one field must be provided' },
  )

export type UpdateProductDto = z.infer<typeof updateProductSchema>
