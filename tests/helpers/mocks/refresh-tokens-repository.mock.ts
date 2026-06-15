import { vi } from 'vitest'

import type { RefreshTokensRepository } from '../../src/modules/auth/repositories/refresh-tokens.repository.js'

export function createRefreshTokensRepositoryMock(
  overrides: Partial<RefreshTokensRepository> = {},
): RefreshTokensRepository {
  return {
    create: vi.fn().mockResolvedValue(undefined),
    findActiveWithUser: vi.fn(),
    rotate: vi.fn().mockResolvedValue(undefined),
    revoke: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}
