import { vi } from 'vitest'

import type { AuditLogsRepository } from '../../src/modules/audit/repositories/audit-logs.repository.js'

export function createAuditLogsRepositoryMock(
  overrides: Partial<AuditLogsRepository> = {},
): AuditLogsRepository {
  return {
    create: vi.fn().mockResolvedValue(undefined),
    findMany: vi.fn(),
    count: vi.fn(),
    findByIdInCompany: vi.fn(),
    ...overrides,
  }
}
