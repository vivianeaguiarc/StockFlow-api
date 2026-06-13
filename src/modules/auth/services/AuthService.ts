import { Prisma, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'

import { env } from '../../../config/env.js'
import { prisma } from '../../../shared/database/prisma.js'
import { AppError } from '../../../shared/errors/AppError.js'
import type { JwtPayload, LoginDto, LoginResponseDto } from '../dtos/login.dto.js'
import type {
  RegisterCompanyDto,
  RegisterCompanyResponseDto,
} from '../dtos/register-company.dto.js'

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

  async login(data: LoginDto): Promise<LoginResponseDto> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { company: true },
    })

    if (!user || user.deletedAt !== null || user.company.deletedAt !== null) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401)
    }

    if (user.status !== 'ACTIVE' || user.company.status !== 'ACTIVE') {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401)
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)

    if (!isPasswordValid) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401)
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        companyId: user.companyId,
        role: user.role,
      } satisfies JwtPayload,
      this.getJwtSecret(),
      { expiresIn: env.JWT_EXPIRES_IN } as SignOptions,
    )

    return {
      accessToken,
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
