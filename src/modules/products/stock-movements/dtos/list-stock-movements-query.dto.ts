import { StockMovementType } from '@prisma/client'
import { z } from 'zod'

const optionalDateQuerySchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? undefined)
  .refine((value) => value === undefined || !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date format',
  })
  .transform((value) => (value ? new Date(value) : undefined))

export const listStockMovementsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    productId: z.string().trim().min(1).optional(),
    userId: z.string().trim().min(1).optional(),
    type: z.nativeEnum(StockMovementType).optional(),
    startDate: optionalDateQuerySchema,
    endDate: optionalDateQuerySchema,
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.startDate.getTime() <= data.endDate.getTime(),
    {
      message: 'startDate must be before or equal to endDate',
      path: ['startDate'],
    },
  )

export type ListStockMovementsQuery = z.infer<typeof listStockMovementsQuerySchema>
