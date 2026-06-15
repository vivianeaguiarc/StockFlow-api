import { type Prisma, UserRole } from '@prisma/client'

import { prisma } from '../../../shared/database/prisma.js'
import type {
  CreateUserRecord,
  RegisterCompanyWithAdminInput,
  RegisterCompanyWithAdminResult,
  UserProfile,
  UsersRepository,
  UserWithCompany,
} from './users.repository.js'

export class PrismaUsersRepository implements UsersRepository {
  async findActiveByEmailWithCompany(email: string): Promise<UserWithCompany | null> {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: { company: true },
    })
  }

  async findActiveByIdWithCompany(userId: string): Promise<UserWithCompany | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    })
  }

  async findProfileById(userId: string): Promise<UserProfile | null> {
    return prisma.user.findFirst({
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
  }

  async findActiveInCompany(companyId: string, userId: string) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
        deletedAt: null,
      },
    })
  }

  async findActiveByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      select: { id: true },
    })
  }

  async create(data: CreateUserRecord) {
    return prisma.user.create({ data })
  }

  async updateActive(userId: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: {
        id: userId,
        deletedAt: null,
      },
      data,
    })
  }

  async softDelete(userId: string, deletedAt: Date): Promise<void> {
    await prisma.user.update({
      where: {
        id: userId,
        deletedAt: null,
      },
      data: { deletedAt },
    })
  }

  async findMany(
    where: Prisma.UserWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.UserOrderByWithRelationInput,
  ) {
    return prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
    })
  }

  async count(where: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where })
  }

  async countActiveAdmins(companyId: string): Promise<number> {
    return prisma.user.count({
      where: {
        companyId,
        role: UserRole.ADMIN,
        deletedAt: null,
        status: 'ACTIVE',
      },
    })
  }

  async findActiveAdminInCompany(companyId: string, userId: string) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
        role: UserRole.ADMIN,
        deletedAt: null,
        status: 'ACTIVE',
      },
    })
  }

  async registerCompanyWithAdmin(
    input: RegisterCompanyWithAdminInput,
  ): Promise<RegisterCompanyWithAdminResult> {
    return prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: input.company,
      })

      const admin = await tx.user.create({
        data: {
          companyId: company.id,
          firstName: input.admin.firstName,
          lastName: input.admin.lastName,
          email: input.admin.email,
          passwordHash: input.admin.passwordHash,
          role: UserRole.ADMIN,
        },
      })

      return { company, admin }
    })
  }
}
