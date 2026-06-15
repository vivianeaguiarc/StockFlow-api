import { AuditAction } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auditLogService } from '../../src/modules/audit/audit-log.service.js'
import { prisma } from '../../src/shared/database/prisma.js'
import { logWarn } from '../../src/shared/logger/logger.js'

vi.mock('../../src/shared/logger/logger.js', () => ({
  logWarn: vi.fn(),
}))

describe('AuditLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('persists audit log with metadata, ipAddress and userAgent', async () => {
    const createSpy = vi.spyOn(prisma.auditLog, 'create').mockResolvedValue({} as never)

    await auditLogService.record({
      companyId: 'company-1',
      userId: 'user-1',
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: 'user-1',
      metadata: { email: 'user@example.com', role: 'ADMIN' },
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    })

    expect(createSpy).toHaveBeenCalledWith({
      data: expect.objectContaining({
        companyId: 'company-1',
        userId: 'user-1',
        action: AuditAction.LOGIN,
        entity: 'User',
        entityId: 'user-1',
        metadata: { email: 'user@example.com', role: 'ADMIN' },
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
      }),
    })
    expect(logWarn).not.toHaveBeenCalled()
  })

  it('logs a warning and does not throw when persistence fails', async () => {
    const error = new Error('database unavailable')
    vi.spyOn(prisma.auditLog, 'create').mockRejectedValue(error)

    await expect(
      auditLogService.record({
        companyId: 'company-1',
        userId: 'user-1',
        action: AuditAction.LOGIN,
        entity: 'User',
        entityId: 'user-1',
      }),
    ).resolves.toBeUndefined()

    expect(logWarn).toHaveBeenCalledWith(
      expect.objectContaining({
        err: error,
        action: AuditAction.LOGIN,
        entity: 'User',
      }),
      'Failed to persist audit log',
    )
  })
})
