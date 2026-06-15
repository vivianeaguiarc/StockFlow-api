import type { Company, Prisma, User } from '@prisma/client'

export type UserWithCompany = User & {
  company: {
    deletedAt: Date | null
    status: string
  }
}

export type UserProfile = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: User['role']
  createdAt: Date
  updatedAt: Date
}

export type CreateUserRecord = {
  companyId: string
  firstName: string
  lastName: string
  email: string
  passwordHash: string
  role: User['role']
}

export type RegisterCompanyWithAdminInput = {
  company: {
    name: string
    document: string
    email: string
    phone: string | null
  }
  admin: {
    firstName: string
    lastName: string
    email: string
    passwordHash: string
  }
}

export type RegisterCompanyWithAdminResult = {
  company: Company
  admin: User
}

export interface UsersRepository {
  findActiveByEmailWithCompany(email: string): Promise<UserWithCompany | null>
  findActiveByIdWithCompany(userId: string): Promise<UserWithCompany | null>
  findProfileById(userId: string): Promise<UserProfile | null>
  findActiveInCompany(companyId: string, userId: string): Promise<User | null>
  findActiveByEmail(email: string): Promise<{ id: string } | null>
  create(data: CreateUserRecord): Promise<User>
  updateActive(userId: string, data: Prisma.UserUpdateInput): Promise<User>
  softDelete(userId: string, deletedAt: Date): Promise<void>
  findMany(
    where: Prisma.UserWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.UserOrderByWithRelationInput,
  ): Promise<User[]>
  count(where: Prisma.UserWhereInput): Promise<number>
  countActiveAdmins(companyId: string): Promise<number>
  findActiveAdminInCompany(companyId: string, userId: string): Promise<User | null>
  registerCompanyWithAdmin(
    input: RegisterCompanyWithAdminInput,
  ): Promise<RegisterCompanyWithAdminResult>
}
