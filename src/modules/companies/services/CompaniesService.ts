import { AuditAction, type Company, Prisma } from '@prisma/client'

import type { AuditContext } from '../../../shared/audit/audit-context.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { executePaginatedQuery } from '../../../shared/utils/pagination.js'
import { auditLogger } from '../../audit/services/AuditLoggerService.js'
import type {
  CompanyResponseDto,
  PaginatedCompaniesResponseDto,
} from '../dtos/company-response.dto.js'
import type { CreateCompanyDto } from '../dtos/create-company.dto.js'
import type { ListCompaniesQuery } from '../dtos/list-companies-query.dto.js'
import type { UpdateCompanyDto } from '../dtos/update-company.dto.js'
import type { CompanyProfileDto } from '../dtos/update-company.dto.js'
import type { UpdateCompanyCrudDto } from '../dtos/update-company-crud.dto.js'
import {
  type CompaniesRepository,
  companiesRepository,
} from '../repositories/companies.repository.js'

export class CompaniesService {
  constructor(private readonly repository: CompaniesRepository = companiesRepository) {}

  async create(
    actorUserId: string,
    actorCompanyId: string,
    data: CreateCompanyDto,
    auditContext?: AuditContext,
  ): Promise<CompanyResponseDto> {
    try {
      const company = await this.repository.create({
        name: data.name,
        document: data.document ?? null,
        email: data.email,
        phone: data.phone ?? null,
        active: data.active ?? true,
      })

      const response = this.toResponse(company)

      await auditLogger.log({
        companyId: actorCompanyId,
        userId: actorUserId,
        action: AuditAction.CREATE_COMPANY,
        entity: 'Company',
        entityId: company.id,
        newValue: response,
        ...auditContext,
      })

      return response
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(this.getDuplicateMessage(error), 409)
      }

      throw error
    }
  }

  async list(companyId: string, query: ListCompaniesQuery): Promise<PaginatedCompaniesResponseDto> {
    const where = {
      id: companyId,
      deletedAt: null,
    }

    const result = await executePaginatedQuery({
      page: query.page,
      pageSize: query.limit,
      findMany: (skip, take) => this.repository.findMany(where, skip, take, { createdAt: 'desc' }),
      count: () => this.repository.count(where),
    })

    return {
      data: result.data.map((company) => this.toResponse(company)),
      pagination: result.pagination,
    }
  }

  async getById(requesterCompanyId: string, companyId: string): Promise<CompanyResponseDto> {
    this.ensureSameCompany(requesterCompanyId, companyId)

    const company = await this.findAccessibleCompany(companyId)
    return this.toResponse(company)
  }

  async updateById(
    requesterCompanyId: string,
    actorUserId: string,
    companyId: string,
    data: UpdateCompanyCrudDto,
    auditContext?: AuditContext,
  ): Promise<CompanyResponseDto> {
    this.ensureSameCompany(requesterCompanyId, companyId)

    const company = await this.findAccessibleCompany(companyId)
    const oldValue = this.toResponse(company)

    try {
      const updated = await this.repository.update(companyId, {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.document !== undefined && { document: data.document }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.active !== undefined && { active: data.active }),
      })

      const response = this.toResponse(updated)

      await auditLogger.log({
        companyId,
        userId: actorUserId,
        action: AuditAction.UPDATE_COMPANY,
        entity: 'Company',
        entityId: companyId,
        oldValue,
        newValue: response,
        ...auditContext,
      })

      return response
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(this.getDuplicateMessage(error), 409)
      }

      throw error
    }
  }

  async deleteById(
    requesterCompanyId: string,
    actorUserId: string,
    companyId: string,
    auditContext?: AuditContext,
  ): Promise<void> {
    this.ensureSameCompany(requesterCompanyId, companyId)

    const company = await this.findAccessibleCompany(companyId)
    const oldValue = this.toResponse(company)
    const deletedAt = new Date()

    await this.repository.softDelete(companyId, deletedAt)

    await auditLogger.log({
      companyId,
      userId: actorUserId,
      action: AuditAction.DELETE_COMPANY,
      entity: 'Company',
      entityId: companyId,
      oldValue,
      newValue: { deletedAt: deletedAt.toISOString(), active: false },
      ...auditContext,
    })
  }

  async getProfile(companyId: string): Promise<CompanyProfileDto> {
    const company = await this.findAccessibleCompany(companyId)

    if (!company.active) {
      throw new AppError('Unauthorized', 401)
    }

    return this.toProfile(company)
  }

  async updateProfile(
    companyId: string,
    actorUserId: string,
    data: UpdateCompanyDto,
    auditContext?: AuditContext,
  ): Promise<CompanyProfileDto> {
    const company = await this.findAccessibleCompany(companyId)

    if (!company.active) {
      throw new AppError('Unauthorized', 401)
    }

    const oldValue = this.toProfile(company)

    try {
      const updated = await this.repository.update(companyId, {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
      })

      const response = this.toProfile(updated)

      await auditLogger.log({
        companyId,
        userId: actorUserId,
        action: AuditAction.UPDATE_COMPANY,
        entity: 'Company',
        entityId: companyId,
        oldValue,
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

  async ensureActiveCompany(companyId: string): Promise<void> {
    const company = await this.repository.findActiveById(companyId)

    if (!company) {
      throw new AppError('Company not found or inactive', 404)
    }
  }

  private ensureSameCompany(requesterCompanyId: string, companyId: string): void {
    if (requesterCompanyId !== companyId) {
      throw new AppError('Company not found', 404)
    }
  }

  private async findAccessibleCompany(companyId: string): Promise<Company> {
    const company = await this.repository.findAccessibleById(companyId)

    if (!company) {
      throw new AppError('Company not found', 404)
    }

    return company
  }

  private getDuplicateMessage(error: Prisma.PrismaClientKnownRequestError): string {
    const target = error.meta?.['target']

    if (Array.isArray(target) && target.includes('document')) {
      return 'Company document already registered'
    }

    if (Array.isArray(target) && target.includes('email')) {
      return 'Email already registered'
    }

    return 'Company already exists'
  }

  private toResponse(company: Company): CompanyResponseDto {
    return {
      id: company.id,
      name: company.name,
      document: company.document,
      email: company.email,
      phone: company.phone,
      active: company.active,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }
  }

  private toProfile(company: Company): CompanyProfileDto {
    return this.toResponse(company)
  }
}
