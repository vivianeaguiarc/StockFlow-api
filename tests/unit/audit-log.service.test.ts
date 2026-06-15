import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuditLogService } from '../../src/modules/audit/audit-log.service.js'
import { AuditAction } from '@prisma/client'
import { logWarn } from '../../src/shared/logger/logger.js'
import { createAuditLogsRepositoryMock } from '../helpers/mocks/audit-logs-repository.mock.js'

vi.mock('../../src/shared/logger/logger.js', () => ({
  logWarn: vi.fn(),
}))

describe('AuditLogService', () => {
  const repository = createAuditLogsRepositoryMock()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('persists audit log with metadata, ipAddress and userAgent', async () => {
    const service = new AuditLogService(repository)

    await service.record({
      companyId: 'company-1',
      userId: 'user-1',
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: 'user-1',
      metadata: { email: 'user@example.com', role: 'ADMIN' },
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    })

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'company-1',
        userId: 'user-1',
        action: AuditAction.LOGIN,
        entity: 'User',
        entityId: 'user-1',
        metadata: { email: 'user@example.com', role: 'ADMIN' },
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
      }),
      undefined,
    )
    expect(logWarn).not.toHaveBeenCalled()
  })

  it('logs a warning and does not throw when persistence fails', async () => {
    const error = new Error('database unavailable')
    vi.mocked(repository.create).mockRejectedValueOnce(error)

    const service = new AuditLogService(repository)

    await expect(
      service.record({
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
