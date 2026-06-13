import { Prisma, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { prisma } from '../../../shared/database/prisma.js'
import { AppError } from '../../../shared/errors/AppError.js'
import {
  buildPaginationMeta,
  getPaginationOffset,
  type PaginationParams,
} from '../../../shared/utils/pagination.js'
import type { CreateUserDto } from '../dtos/create-user.dto.js'
import type { UpdateUserDto } from '../dtos/update-user.dto.js'
import type { PaginatedUsersResponseDto, UserResponseDto } from '../dtos/user-response.dto.js'

const BCRYPT_SALT_ROUNDS = 12

export class UsersService {
  async create(companyId: string, data: CreateUserDto): Promise<UserResponseDto> {
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS)

    try {
      const user = await prisma.user.create({
        data: {
          companyId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash,
          role: data.role,
        },
      })

      return this.toResponse(user)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Email already registered', 409)
      }

      throw error
    }
  }

  async list(companyId: string, pagination: PaginationParams): Promise<PaginatedUsersResponseDto> {
    const { page, limit } = pagination
    const offset = getPaginationOffset(page, limit)

    const where = {
      companyId,
      deletedAt: null,
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return {
      data: users.map((user) => this.toResponse(user)),
      meta: buildPaginationMeta(page, limit, total),
    }
  }

  async getById(companyId: string, userId: string): Promise<UserResponseDto> {
    const user = await this.findActiveUserInCompany(companyId, userId)
    return this.toResponse(user)
  }

  async update(companyId: string, userId: string, data: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findActiveUserInCompany(companyId, userId)

    if (user.role === UserRole.ADMIN && (data.role !== undefined || data.status === 'INACTIVE')) {
      await this.ensureNotLastAdmin(companyId, userId)
    }

    const passwordHash =
      data.password !== undefined ? await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS) : undefined

    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.firstName !== undefined && { firstName: data.firstName }),
          ...(data.lastName !== undefined && { lastName: data.lastName }),
          ...(data.email !== undefined && { email: data.email }),
          ...(passwordHash !== undefined && { passwordHash }),
          ...(data.role !== undefined && { role: data.role }),
          ...(data.status !== undefined && { status: data.status }),
        },
      })

      return this.toResponse(updated)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Email already registered', 409)
      }

      throw error
    }
  }

  async delete(companyId: string, userId: string, currentUserId: string): Promise<void> {
    if (userId === currentUserId) {
      throw new AppError('Cannot delete yourself', 400)
    }

    const user = await this.findActiveUserInCompany(companyId, userId)

    if (user.role === UserRole.ADMIN) {
      await this.ensureNotLastAdmin(companyId, userId)
    }

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    })
  }

  private async findActiveUserInCompany(companyId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
        deletedAt: null,
      },
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  }

  private async ensureNotLastAdmin(companyId: string, userId: string): Promise<void> {
    const adminCount = await prisma.user.count({
      where: {
        companyId,
        role: UserRole.ADMIN,
        deletedAt: null,
        status: 'ACTIVE',
      },
    })

    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (user?.role === UserRole.ADMIN && adminCount <= 1) {
      throw new AppError('Cannot remove the last admin of the company', 409)
    }
  }

  private toResponse(user: {
    id: string
    companyId: string
    firstName: string
    lastName: string
    email: string
    role: UserRole
    status: string
    createdAt: Date
    updatedAt: Date
  }): UserResponseDto {
    return {
      id: user.id,
      companyId: user.companyId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status as UserResponseDto['status'],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
