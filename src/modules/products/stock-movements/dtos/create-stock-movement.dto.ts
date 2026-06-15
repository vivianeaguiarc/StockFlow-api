import { z } from 'zod'

export const createStockMovementSchema = z
  .object({
    type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
    quantity: z.coerce.number().int(),
    reason: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'IN' || data.type === 'OUT') {
      if (data.quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Quantity must be greater than zero',
          path: ['quantity'],
        })
      }
    }

    if (data.type === 'ADJUSTMENT' && data.quantity < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Quantity cannot be negative',
        path: ['quantity'],
      })
    }
  })

export type CreateStockMovementDto = z.infer<typeof createStockMovementSchema>
