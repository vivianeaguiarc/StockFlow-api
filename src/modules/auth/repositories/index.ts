import { PrismaRefreshTokensRepository } from './prisma-refresh-tokens.repository.js'
import type { RefreshTokensRepository } from './refresh-tokens.repository.js'

export type { RefreshTokensRepository, RefreshTokenWithUser } from './refresh-tokens.repository.js'

export function createRefreshTokensRepository(): RefreshTokensRepository {
  return new PrismaRefreshTokensRepository()
}

export const refreshTokensRepository = createRefreshTokensRepository()
