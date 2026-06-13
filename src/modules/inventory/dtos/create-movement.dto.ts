import { z } from 'zod'

export const createMovementSchema = z
  .object({
    productId: z.string().trim().min(1, 'Product is required'),
    type: z.enum(['ENTRY', 'EXIT', 'ADJUSTMENT']),
    quantity: z.coerce.number().int(),
    reason: z.string().trim().min(1, 'Reason is required'),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'ENTRY' || data.type === 'EXIT') {
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

export type CreateMovementDto = z.infer<typeof createMovementSchema>

export type MovementResponseDto = {
  id: string
  companyId: string
  productId: string
  userId: string
  type: string
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string
  createdAt: Date
}

export type PaginatedMovementsResponseDto = {
  data: MovementResponseDto[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
