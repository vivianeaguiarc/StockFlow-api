import type { Company, Prisma } from '@prisma/client'

export type CreateCompanyRecord = {
  name: string
  document?: string | null
  email: string
  phone?: string | null
  active?: boolean
}

export type UpdateCompanyRecord = {
  name?: string
  document?: string | null
  email?: string
  phone?: string | null
  active?: boolean
}

export interface CompaniesRepository {
  create(data: CreateCompanyRecord): Promise<Company>
  findActiveById(id: string): Promise<Company | null>
  findAccessibleById(id: string): Promise<Company | null>
  findMany(
    where: Prisma.CompanyWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.CompanyOrderByWithRelationInput,
  ): Promise<Company[]>
  count(where: Prisma.CompanyWhereInput): Promise<number>
  update(id: string, data: UpdateCompanyRecord): Promise<Company>
  softDelete(id: string, deletedAt: Date): Promise<Company>
}

export { prismaCompaniesRepository as companiesRepository } from './prisma-companies.repository.js'
