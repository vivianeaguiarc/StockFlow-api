import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuditService } from '../../src/modules/audit/services/AuditService.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { createAuditLogsRepositoryMock } from '../helpers/mocks/audit-logs-repository.mock.js'

describe('AuditService', () => {
  const repository = createAuditLogsRepositoryMock()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists audit logs for a company', async () => {
    const log = {
      id: 'log-1',
      companyId: 'company-1',
      userId: 'user-1',
      action: 'LOGIN',
      entity: 'User',
      entityId: 'user-1',
      metadata: { email: 'user@example.com' },
      oldValue: null,
      newValue: null,
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
      createdAt: new Date(),
    }

    vi.mocked(repository.findMany).mockResolvedValue([log] as never)
    vi.mocked(repository.count).mockResolvedValue(1)

    const service = new AuditService(repository)
    const result = await service.listLogs('company-1', {
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })

    expect(result.data).toHaveLength(1)
    expect(result.data[0]?.action).toBe('LOGIN')
  })

  it('returns audit log by id', async () => {
    const log = {
      id: 'log-1',
      companyId: 'company-1',
      userId: 'user-1',
      action: 'CREATE_USER',
      entity: 'User',
      entityId: 'user-2',
      metadata: null,
      oldValue: null,
      newValue: null,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
    }

    vi.mocked(repository.findByIdInCompany).mockResolvedValue(log as never)

    const service = new AuditService(repository)
    const result = await service.getLogById('company-1', 'log-1')

    expect(result.id).toBe('log-1')
  })

  it('throws 404 when audit log is not found', async () => {
    vi.mocked(repository.findByIdInCompany).mockResolvedValue(null)

    const service = new AuditService(repository)

    await expect(service.getLogById('company-1', 'missing')).rejects.toMatchObject({
      message: 'Audit log not found',
      statusCode: 404,
    } satisfies Partial<AppError>)
  })
})
