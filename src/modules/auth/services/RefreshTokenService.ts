import { env } from '../../../config/env.js'
import { AppError } from '../../../shared/errors/AppError.js'
import type { UserWithCompany } from '../../users/repositories/users.repository.js'
import { type RefreshTokensRepository, refreshTokensRepository } from '../repositories/index.js'
import { generateRefreshTokenValue, hashRefreshToken } from '../utils/refresh-token.utils.js'

const INVALID_REFRESH_TOKEN_MESSAGE = 'Unauthorized'

export class RefreshTokenService {
  constructor(private readonly repository: RefreshTokensRepository = refreshTokensRepository) {}

  async issue(userId: string): Promise<string> {
    const token = generateRefreshTokenValue()
    const tokenHash = hashRefreshToken(token)
    const expiresAt = this.getExpirationDate()

    await this.repository.create(userId, tokenHash, expiresAt)

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

    await this.repository.rotate(
      storedToken.id,
      storedToken.userId,
      newTokenHash,
      expiresAt,
      revokedAt,
    )

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

    await this.repository.revoke(storedToken.id, new Date())

    return storedToken.user
  }

  private async findActiveToken(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken)
    return this.repository.findActiveWithUser(tokenHash)
  }

  private ensureUserCanAuthenticate(user: UserWithCompany): void {
    if (
      user.deletedAt !== null ||
      user.company.deletedAt !== null ||
      user.status !== 'ACTIVE' ||
      !user.company.active
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
