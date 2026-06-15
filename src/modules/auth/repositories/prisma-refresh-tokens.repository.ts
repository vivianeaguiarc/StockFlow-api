import { prisma } from '../../../shared/database/prisma.js'
import type { RefreshTokensRepository } from './refresh-tokens.repository.js'

export class PrismaRefreshTokensRepository implements RefreshTokensRepository {
  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    })
  }

  async findActiveWithUser(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          include: {
            company: {
              select: {
                deletedAt: true,
                status: true,
              },
            },
          },
        },
      },
    })
  }

  async rotate(
    storedTokenId: string,
    userId: string,
    newTokenHash: string,
    expiresAt: Date,
    revokedAt: Date,
  ): Promise<void> {
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedTokenId },
        data: { revokedAt },
      }),
      prisma.refreshToken.create({
        data: {
          userId,
          tokenHash: newTokenHash,
          expiresAt,
        },
      }),
    ])
  }

  async revoke(storedTokenId: string, revokedAt: Date): Promise<void> {
    await prisma.refreshToken.update({
      where: { id: storedTokenId },
      data: { revokedAt },
    })
  }
}
