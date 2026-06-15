import { AuditAction, Prisma } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auditLogger } from '../../src/modules/audit/services/AuditLoggerService.js'
import { CompaniesService } from '../../src/modules/companies/services/CompaniesService.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { createCompaniesRepositoryMock } from '../helpers/mocks/companies-repository.mock.js'

vi.mock('../../src/modules/audit/services/AuditLoggerService.js', () => ({
  auditLogger: {
    log: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('CompaniesService', () => {
  const repository = createCompaniesRepositoryMock()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates company and records CREATE_COMPANY audit log', async () => {
    const createdAt = new Date()
    vi.mocked(repository.create).mockResolvedValue({
      id: 'company-2',
      name: 'New Corp',
      document: '123',
      email: 'new@corp.com',
      phone: null,
      active: true,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    })

    const service = new CompaniesService(repository)
    const result = await service.create('admin-1', 'company-1', {
      name: 'New Corp',
      document: '123',
      email: 'new@corp.com',
    })

    expect(result.name).toBe('New Corp')
    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.CREATE_COMPANY,
        entity: 'Company',
        entityId: 'company-2',
      }),
    )
  })

  it('lists only the requester company', async () => {
    const createdAt = new Date()
    vi.mocked(repository.findMany).mockResolvedValue([
      {
        id: 'company-1',
        name: 'Tenant',
        document: null,
        email: 'tenant@test.com',
        phone: null,
        active: true,
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
      },
    ])
    vi.mocked(repository.count).mockResolvedValue(1)

    const service = new CompaniesService(repository)
    const result = await service.list('company-1', { page: 1, limit: 10 })

    expect(repository.findMany).toHaveBeenCalledWith({ id: 'company-1', deletedAt: null }, 0, 10, {
      createdAt: 'desc',
    })
    expect(result.data).toHaveLength(1)
  })

  it('returns 404 when accessing another company id', async () => {
    const service = new CompaniesService(repository)

    await expect(service.getById('company-1', 'company-2')).rejects.toMatchObject({
      message: 'Company not found',
      statusCode: 404,
    } satisfies Partial<AppError>)
  })

  it('soft deletes company and records DELETE_COMPANY audit log', async () => {
    const createdAt = new Date()
    vi.mocked(repository.findAccessibleById).mockResolvedValue({
      id: 'company-1',
      name: 'Tenant',
      document: null,
      email: 'tenant@test.com',
      phone: null,
      active: true,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    })
    vi.mocked(repository.softDelete).mockResolvedValue({
      id: 'company-1',
      name: 'Tenant',
      document: null,
      email: 'tenant@test.com',
      phone: null,
      active: false,
      createdAt,
      updatedAt: createdAt,
      deletedAt: createdAt,
    })

    const service = new CompaniesService(repository)
    await service.deleteById('company-1', 'admin-1', 'company-1')

    expect(repository.softDelete).toHaveBeenCalledWith('company-1', expect.any(Date))
    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.DELETE_COMPANY,
        entityId: 'company-1',
      }),
    )
  })

  it('throws 409 when document already exists', async () => {
    vi.mocked(repository.create).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.19.3',
        meta: { target: ['document'] },
      }),
    )

    const service = new CompaniesService(repository)

    await expect(
      service.create('admin-1', 'company-1', {
        name: 'Dup',
        document: '123',
        email: 'dup@test.com',
      }),
    ).rejects.toMatchObject({
      message: 'Company document already registered',
      statusCode: 409,
    } satisfies Partial<AppError>)
  })
})
