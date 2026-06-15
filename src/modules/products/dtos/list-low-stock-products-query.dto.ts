import { z } from 'zod'

export const listLowStockProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  name: z.string().trim().min(1).optional(),
  sku: z.string().trim().min(1).optional(),
})

export type ListLowStockProductsQuery = z.infer<typeof listLowStockProductsQuerySchema>
