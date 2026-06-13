import { CompanyStatus, Prisma } from '@prisma/client'

import { prisma } from '../../../shared/database/prisma.js'
import { AppError } from '../../../shared/errors/AppError.js'
import type { CompanyProfileDto, UpdateCompanyDto } from '../dtos/update-company.dto.js'

export class CompaniesService {
  async getProfile(companyId: string): Promise<CompanyProfileDto> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company || company.deletedAt !== null) {
      throw new AppError('Company not found', 404)
    }

    if (company.status !== CompanyStatus.ACTIVE) {
      throw new AppError('Unauthorized', 401)
    }

    return this.toProfile(company)
  }

  async updateProfile(companyId: string, data: UpdateCompanyDto): Promise<CompanyProfileDto> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company || company.deletedAt !== null) {
      throw new AppError('Company not found', 404)
    }

    if (company.status !== CompanyStatus.ACTIVE) {
      throw new AppError('Unauthorized', 401)
    }

    try {
      const updated = await prisma.company.update({
        where: { id: companyId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.phone !== undefined && { phone: data.phone }),
        },
      })

      return this.toProfile(updated)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Email already registered', 409)
      }

      throw error
    }
  }

  private toProfile(company: {
    id: string
    name: string
    document: string
    email: string
    phone: string | null
    status: CompanyStatus
    createdAt: Date
    updatedAt: Date
  }): CompanyProfileDto {
    return {
      id: company.id,
      name: company.name,
      document: company.document,
      email: company.email,
      phone: company.phone,
      status: company.status,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }
  }
}
