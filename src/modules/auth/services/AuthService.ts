import { AuditAction, Prisma, type User, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'

import { env } from '../../../config/env.js'
import type { AuditContext } from '../../../shared/audit/audit-context.js'
import { prisma } from '../../../shared/database/prisma.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { auditLogService } from '../../audit/audit-log.service.js'
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
import { refreshTokenService } from './RefreshTokenService.js'

const BCRYPT_SALT_ROUNDS = 12
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password'

export class AuthService {
  async register(data: RegisterCompanyDto): Promise<RegisterCompanyResponseDto> {
    const passwordHash = await bcrypt.hash(data.admin.password, BCRYPT_SALT_ROUNDS)

    try {
      const result = await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            name: data.company.name,
            document: data.company.document,
            email: data.company.email,
            phone: data.company.phone ?? null,
          },
        })

        const admin = await tx.user.create({
          data: {
            companyId: company.id,
            firstName: data.admin.firstName,
            lastName: data.admin.lastName,
            email: data.admin.email,
            passwordHash,
            role: UserRole.ADMIN,
          },
        })

        return { company, admin }
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
    const user = await prisma.user.findFirst({
      where: {
        email: data.email,
        deletedAt: null,
      },
      include: { company: true },
    })

    if (!user || user.company.deletedAt !== null) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401)
    }

    if (user.status !== 'ACTIVE' || user.company.status !== 'ACTIVE') {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401)
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)

    if (!isPasswordValid) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401)
    }

    const accessToken = this.signAccessToken(user)
    const refreshToken = await refreshTokenService.issue(user.id)

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
    const { token: refreshToken, user } = await refreshTokenService.rotate(data.refreshToken)
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
    const user = await refreshTokenService.revoke(data.refreshToken)

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
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

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

  private signAccessToken(user: Pick<User, 'id' | 'companyId' | 'role'>): string {
    return jwt.sign(
      {
        userId: user.id,
        companyId: user.companyId,
        role: user.role,
      } satisfies JwtPayload,
      this.getJwtSecret(),
      { expiresIn: env.JWT_EXPIRES_IN } as SignOptions,
    )
  }

  private getJwtSecret(): string {
    if (!env.JWT_SECRET) {
      throw new AppError('Internal server error', 500)
    }

    return env.JWT_SECRET
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
