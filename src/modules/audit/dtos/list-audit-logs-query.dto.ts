import { AuditAction } from '@prisma/client'
import { z } from 'zod'

import { paginationQuerySchema } from '../../../shared/dtos/pagination-query.dto.js'

export const listAuditLogsQuerySchema = paginationQuerySchema.extend({
  action: z.nativeEnum(AuditAction).optional(),
  entity: z.string().trim().min(1).optional(),
  userId: z.string().cuid().optional(),
  sortBy: z.enum(['createdAt', 'action', 'entity']).default('createdAt'),
})

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>
