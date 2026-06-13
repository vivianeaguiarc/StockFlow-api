import type { User } from '@prisma/client'

import { env } from '../../../config/env.js'
import { prisma } from '../../../shared/database/prisma.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { generateRefreshTokenValue, hashRefreshToken } from '../utils/refresh-token.utils.js'

const INVALID_REFRESH_TOKEN_MESSAGE = 'Unauthorized'

type UserWithCompany = User & {
  company: {
    deletedAt: Date | null
    status: string
  }
}

export class RefreshTokenService {
  async issue(userId: string): Promise<string> {
    const token = generateRefreshTokenValue()
    const tokenHash = hashRefreshToken(token)
    const expiresAt = this.getExpirationDate()

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    })

    return token
  }

  async rotate(refreshToken: string): Promise<{ token: string; user: UserWithCompany }> {
    const storedToken = await this.findActiveToken(refreshToken)

    if (!storedToken) {
      throw new AppError(INVALID_REFRESH_TOKEN_MESSAGE, 401)
    }

    this.ensureUserCanAuthenticate(storedToken.user)

    const newToken = generateRefreshTokenValue()
    const newTokenHash = hashRefreshToken(newToken)
    const expiresAt = this.getExpirationDate()
    const revokedAt = new Date()

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt },
      }),
      prisma.refreshToken.create({
        data: {
          userId: storedToken.userId,
          tokenHash: newTokenHash,
          expiresAt,
        },
      }),
    ])

    return {
      token: newToken,
      user: storedToken.user,
    }
  }

  async revoke(refreshToken: string): Promise<UserWithCompany | null> {
    const storedToken = await this.findActiveToken(refreshToken)

    if (!storedToken) {
      return null
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    })

    return storedToken.user
  }

  private async findActiveToken(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken)

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

  private ensureUserCanAuthenticate(user: UserWithCompany): void {
    if (
      user.deletedAt !== null ||
      user.company.deletedAt !== null ||
      user.status !== 'ACTIVE' ||
      user.company.status !== 'ACTIVE'
    ) {
      throw new AppError(INVALID_REFRESH_TOKEN_MESSAGE, 401)
    }
  }

  private getExpirationDate(): Date {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_IN_DAYS)

    return expiresAt
  }
}

export const refreshTokenService = new RefreshTokenService()
