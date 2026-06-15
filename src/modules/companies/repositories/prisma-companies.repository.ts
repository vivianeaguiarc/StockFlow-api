import { type Prisma } from '@prisma/client'

import { prisma } from '../../../shared/database/prisma.js'
import type {
  CompaniesRepository,
  CreateCompanyRecord,
  UpdateCompanyRecord,
} from './companies.repository.js'

export class PrismaCompaniesRepository implements CompaniesRepository {
  async create(data: CreateCompanyRecord) {
    return prisma.company.create({
      data: {
        name: data.name,
        document: data.document ?? null,
        email: data.email,
        phone: data.phone ?? null,
        active: data.active ?? true,
      },
    })
  }

  async findActiveById(id: string) {
    return prisma.company.findFirst({
      where: {
        id,
        deletedAt: null,
        active: true,
      },
    })
  }

  async findAccessibleById(id: string) {
    return prisma.company.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  async findMany(
    where: Prisma.CompanyWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.CompanyOrderByWithRelationInput,
  ) {
    return prisma.company.findMany({
      where,
      skip,
      take,
      orderBy,
    })
  }

  async count(where: Prisma.CompanyWhereInput): Promise<number> {
    return prisma.company.count({ where })
  }

  async update(id: string, data: UpdateCompanyRecord) {
    return prisma.company.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.document !== undefined && { document: data.document }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.active !== undefined && { active: data.active }),
      },
    })
  }

  async softDelete(id: string, deletedAt: Date) {
    return prisma.company.update({
      where: { id },
      data: {
        deletedAt,
        active: false,
      },
    })
  }
}

export const prismaCompaniesRepository = new PrismaCompaniesRepository()
