import type { User } from '@prisma/client'

export type RefreshTokenWithUser = {
  id: string
  userId: string
  user: User & {
    company: {
      deletedAt: Date | null
      active: boolean
    }
  }
}

export interface RefreshTokensRepository {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<void>
  findActiveWithUser(tokenHash: string): Promise<RefreshTokenWithUser | null>
  rotate(
    storedTokenId: string,
    userId: string,
    newTokenHash: string,
    expiresAt: Date,
    revokedAt: Date,
  ): Promise<void>
  revoke(storedTokenId: string, revokedAt: Date): Promise<void>
}
