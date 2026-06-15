import { AuditAction } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'

import { auditLogService } from '../../src/modules/audit/audit-log.service.js'
import { AuditLoggerService } from '../../src/modules/audit/services/AuditLoggerService.js'

vi.mock('../../src/modules/audit/audit-log.service.js', () => ({
  auditLogService: {
    record: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('AuditLoggerService', () => {
  it('delegates log calls to auditLogService', async () => {
    const service = new AuditLoggerService()

    await service.log({
      companyId: 'company-1',
      userId: 'user-1',
      action: AuditAction.CREATE,
      entity: 'Category',
      entityId: 'category-1',
      newValue: { name: 'Books' },
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    })

    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'company-1',
        action: AuditAction.CREATE,
        entity: 'Category',
        ipAddress: '127.0.0.1',
      }),
    )
  })
})
