import { AuditAction, Prisma, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

import type { AuditContext } from '../../../shared/audit/audit-context.js'
import { prisma } from '../../../shared/database/prisma.js'
import { AppError } from '../../../shared/errors/AppError.js'
import {
  buildContainsSearchFilter,
  buildLimitPaginationMeta,
  buildOrderBy,
  executePaginatedQuery,
} from '../../../shared/utils/pagination.js'
import { auditLogger } from '../../audit/services/AuditLoggerService.js'
import type { CreateUserDto } from '../dtos/create-user.dto.js'
import type { ListUsersQuery } from '../dtos/list-users-query.dto.js'
import type { UpdateUserDto } from '../dtos/update-user.dto.js'
import type { PaginatedUsersResponseDto, UserResponseDto } from '../dtos/user-response.dto.js'

const BCRYPT_SALT_ROUNDS = 12

export class UsersService {
  async create(
    companyId: string,
    actorUserId: string,
    data: CreateUserDto,
    auditContext?: AuditContext,
  ): Promise<UserResponseDto> {
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS)

    try {
      const existingActiveUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          deletedAt: null,
        },
        select: { id: true },
      })

      if (existingActiveUser) {
        throw new AppError('Email already registered', 409)
      }

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

      const response = this.toResponse(user)

      await auditLogger.log({
        companyId,
        userId: actorUserId,
        action: AuditAction.CREATE,
        entity: 'User',
        entityId: user.id,
        newValue: response,
        ...auditContext,
      })

      return response
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Email already registered', 409)
      }

      throw error
    }
  }

  async list(companyId: string, query: ListUsersQuery): Promise<PaginatedUsersResponseDto> {
    const { page, limit, sortBy, sortOrder, role, status, search } = query
    const searchFilter = buildContainsSearchFilter(search, ['firstName', 'lastName', 'email'])
    const orderBy = buildOrderBy(
      sortBy,
      sortOrder,
      ['createdAt', 'firstName', 'lastName', 'email', 'role', 'status'] as const,
      'createdAt',
    )

    const where: Prisma.UserWhereInput = {
      companyId,
      deletedAt: null,
      ...(role && { role }),
      ...(status && { status }),
      ...(searchFilter && { OR: searchFilter }),
    }

    const result = await executePaginatedQuery({
      page,
      pageSize: limit,
      findMany: (skip, take) =>
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy,
        }),
      count: () => prisma.user.count({ where }),
    })

    return {
      data: result.data.map((user) => this.toResponse(user)),
      pagination: buildLimitPaginationMeta(page, limit, result.meta.totalItems),
    }
  }

  async getById(companyId: string, userId: string): Promise<UserResponseDto> {
    const user = await this.findActiveUserInCompany(companyId, userId)
    return this.toResponse(user)
  }

  async update(
    companyId: string,
    actorUserId: string,
    userId: string,
    data: UpdateUserDto,
    auditContext?: AuditContext,
  ): Promise<UserResponseDto> {
    const user = await this.findActiveUserInCompany(companyId, userId)
    const oldValue = this.toResponse(user)

    if (user.role === UserRole.ADMIN && (data.role !== undefined || data.status === 'INACTIVE')) {
      await this.ensureNotLastAdmin(companyId, userId)
    }

    const passwordHash =
      data.password !== undefined ? await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS) : undefined

    try {
      const updated = await prisma.user.update({
        where: {
          id: userId,
          deletedAt: null,
        },
        data: {
          ...(data.firstName !== undefined && { firstName: data.firstName }),
          ...(data.lastName !== undefined && { lastName: data.lastName }),
          ...(data.email !== undefined && { email: data.email }),
          ...(passwordHash !== undefined && { passwordHash }),
          ...(data.role !== undefined && { role: data.role }),
          ...(data.status !== undefined && { status: data.status }),
        },
      })

      const response = this.toResponse(updated)

      await auditLogger.log({
        companyId,
        userId: actorUserId,
        action: AuditAction.UPDATE,
        entity: 'User',
        entityId: userId,
        oldValue,
        newValue: response,
        ...auditContext,
      })

      return response
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('User not found', 404)
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Email already registered', 409)
      }

      throw error
    }
  }

  async delete(
    companyId: string,
    actorUserId: string,
    userId: string,
    currentUserId: string,
    auditContext?: AuditContext,
  ): Promise<void> {
    if (userId === currentUserId) {
      throw new AppError('Cannot delete yourself', 400)
    }

    const user = await this.findActiveUserInCompany(companyId, userId)
    const oldValue = this.toResponse(user)

    if (user.role === UserRole.ADMIN) {
      await this.ensureNotLastAdmin(companyId, userId)
    }

    const deletedAt = new Date()

    await prisma.user.update({
      where: {
        id: userId,
        deletedAt: null,
      },
      data: { deletedAt },
    })

    await auditLogger.log({
      companyId,
      userId: actorUserId,
      action: AuditAction.DELETE,
      entity: 'User',
      entityId: userId,
      oldValue,
      newValue: { deletedAt: deletedAt.toISOString() },
      ...auditContext,
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

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
        role: UserRole.ADMIN,
        deletedAt: null,
        status: 'ACTIVE',
      },
    })

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
