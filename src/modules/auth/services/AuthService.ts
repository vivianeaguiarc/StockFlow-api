import { AuditAction, Prisma, type User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'

import { env } from '../../../config/env.js'
import { getJwtAccessSecret } from '../../../config/production-secrets.js'
import type { AuditContext } from '../../../shared/audit/audit-context.js'
import { authMeKey, CACHE_DETAIL_TTL_SECONDS } from '../../../shared/cache/cache-keys.js'
import { cacheService } from '../../../shared/cache/CacheService.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { JWT_ALGORITHM } from '../../../shared/security/rate-limit.js'
import { auditLogService } from '../../audit/audit-log.service.js'
import {
  type UsersRepository,
  usersRepository as defaultUsersRepository,
} from '../../users/repositories/index.js'
import type { AuthMeResponseDto } from '../dtos/auth-me-response.dto.js'
import type { JwtPayload, LoginDto, LoginResponseDto } from '../dtos/login.dto.js'
import type {
  LogoutDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from '../dtos/refresh-token.dto.js'
import type {
  RegisterCompanyDto,
  RegisterCompanyResponseDto,
} from '../dtos/register-company.dto.js'
import type { RefreshTokenService } from './RefreshTokenService.js'
import { refreshTokenService } from './RefreshTokenService.js'

const BCRYPT_SALT_ROUNDS = 12
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password'

export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository = defaultUsersRepository,
    private readonly refreshTokens: RefreshTokenService = refreshTokenService,
  ) {}

  async register(data: RegisterCompanyDto): Promise<RegisterCompanyResponseDto> {
    const passwordHash = await bcrypt.hash(data.admin.password, BCRYPT_SALT_ROUNDS)

    try {
      const result = await this.usersRepository.registerCompanyWithAdmin({
        company: {
          name: data.company.name,
          document: data.company.document ?? null,
          email: data.company.email,
          phone: data.company.phone ?? null,
        },
        admin: {
          firstName: data.admin.firstName,
          lastName: data.admin.lastName,
          email: data.admin.email,
          passwordHash,
        },
      })

      return {
        company: {
          id: result.company.id,
          name: result.company.name,
          email: result.company.email,
        },
        admin: {
          id: result.admin.id,
          firstName: result.admin.firstName,
          lastName: result.admin.lastName,
          email: result.admin.email,
          role: 'ADMIN',
        },
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(this.getDuplicateMessage(error), 409)
      }

      throw error
    }
  }

  async login(data: LoginDto, auditContext?: AuditContext): Promise<LoginResponseDto> {
    const user = await this.usersRepository.findActiveByEmailWithCompany(data.email)

    if (!user || user.company.deletedAt !== null) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401)
    }

    if (user.status !== 'ACTIVE' || !user.company.active) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401)
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)

    if (!isPasswordValid) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401)
    }

    const accessToken = this.signAccessToken(user)
    const refreshToken = await this.refreshTokens.issue(user.id)

    await auditLogService.record({
      companyId: user.companyId,
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
      },
      ...auditContext,
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        companyId: user.companyId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    }
  }

  async refresh(
    data: RefreshTokenDto,
    auditContext?: AuditContext,
  ): Promise<RefreshTokenResponseDto> {
    const { token: refreshToken, user } = await this.refreshTokens.rotate(data.refreshToken)
    const accessToken = this.signAccessToken(user)

    await auditLogService.record({
      companyId: user.companyId,
      userId: user.id,
      action: AuditAction.REFRESH_TOKEN,
      entity: 'User',
      entityId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
      },
      ipAddress: auditContext?.ipAddress ?? null,
      userAgent: auditContext?.userAgent ?? null,
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  async logout(data: LogoutDto, auditContext?: AuditContext): Promise<void> {
    const user = await this.refreshTokens.revoke(data.refreshToken)

    if (!user) {
      return
    }

    await auditLogService.record({
      companyId: user.companyId,
      userId: user.id,
      action: AuditAction.LOGOUT,
      entity: 'User',
      entityId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
      },
      ipAddress: auditContext?.ipAddress ?? null,
      userAgent: auditContext?.userAgent ?? null,
    })
  }

  async getMe(userId: string): Promise<AuthMeResponseDto> {
    const cacheKey = authMeKey(userId)

    return cacheService.getOrSet(cacheKey, () => this.fetchMe(userId), CACHE_DETAIL_TTL_SECONDS)
  }

  private async fetchMe(userId: string): Promise<AuthMeResponseDto> {
    const user = await this.usersRepository.findProfileById(userId)

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  private signAccessToken(user: Pick<User, 'id' | 'companyId' | 'role' | 'email'>): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        companyId: user.companyId,
        role: user.role,
      } satisfies JwtPayload,
      this.getJwtSecret(),
      { expiresIn: env.JWT_EXPIRES_IN, algorithm: JWT_ALGORITHM } as SignOptions,
    )
  }

  private getJwtSecret(): string {
    const secret = getJwtAccessSecret()

    if (!secret) {
      throw new AppError('Internal server error', 500)
    }

    return secret
  }

  private getDuplicateMessage(error: Prisma.PrismaClientKnownRequestError): string {
    const target = error.meta?.['target']

    if (Array.isArray(target)) {
      if (target.includes('document')) {
        return 'Company document already registered'
      }

      if (target.some((field) => field.includes('email'))) {
        return 'Email already registered'
      }
    }

    return 'Company or user already exists'
  }
}
