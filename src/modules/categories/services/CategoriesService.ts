import { AuditAction, CategoryStatus, Prisma } from '@prisma/client'

import type { AuditContext } from '../../../shared/audit/audit-context.js'
import { prisma } from '../../../shared/database/prisma.js'
import { AppError } from '../../../shared/errors/AppError.js'
import {
  buildPaginationMeta,
  getPaginationOffset,
  type PaginationParams,
} from '../../../shared/utils/pagination.js'
import { auditLogger } from '../../audit/services/AuditLoggerService.js'
import type {
  CategoryResponseDto,
  PaginatedCategoriesResponseDto,
} from '../dtos/category-response.dto.js'
import type { CreateCategoryDto } from '../dtos/create-category.dto.js'
import type { UpdateCategoryDto } from '../dtos/update-category.dto.js'

export class CategoriesService {
  async create(
    companyId: string,
    actorUserId: string,
    data: CreateCategoryDto,
    auditContext?: AuditContext,
  ): Promise<CategoryResponseDto> {
    try {
      const category = await prisma.category.create({
        data: {
          companyId,
          name: data.name,
          description: data.description ?? null,
        },
      })

      const response = this.toResponse(category)

      await auditLogger.log({
        companyId,
        userId: actorUserId,
        action: AuditAction.CREATE,
        entity: 'Category',
        entityId: category.id,
        newValue: response,
        ...auditContext,
      })

      return response
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Category name already exists for this company', 409)
      }

      throw error
    }
  }

  async list(
    companyId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedCategoriesResponseDto> {
    const { page, limit } = pagination
    const offset = getPaginationOffset(page, limit)

    const where = {
      companyId,
      deletedAt: null,
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.category.count({ where }),
    ])

    return {
      data: categories.map((category) => this.toResponse(category)),
      meta: buildPaginationMeta(page, limit, total),
    }
  }

  async getById(companyId: string, categoryId: string): Promise<CategoryResponseDto> {
    const category = await this.findActiveCategoryInCompany(companyId, categoryId)
    return this.toResponse(category)
  }

  async update(
    companyId: string,
    actorUserId: string,
    categoryId: string,
    data: UpdateCategoryDto,
    auditContext?: AuditContext,
  ): Promise<CategoryResponseDto> {
    const category = await this.findActiveCategoryInCompany(companyId, categoryId)
    const oldValue = this.toResponse(category)

    try {
      const updated = await prisma.category.update({
        where: { id: categoryId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.status !== undefined && { status: data.status }),
        },
      })

      const response = this.toResponse(updated)

      await auditLogger.log({
        companyId,
        userId: actorUserId,
        action: AuditAction.UPDATE,
        entity: 'Category',
        entityId: categoryId,
        oldValue,
        newValue: response,
        ...auditContext,
      })

      return response
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Category name already exists for this company', 409)
      }

      throw error
    }
  }

  async delete(
    companyId: string,
    actorUserId: string,
    categoryId: string,
    auditContext?: AuditContext,
  ): Promise<void> {
    const category = await this.findActiveCategoryInCompany(companyId, categoryId)
    const oldValue = this.toResponse(category)
    const deletedAt = new Date()

    await prisma.category.update({
      where: { id: categoryId },
      data: {
        deletedAt,
        status: CategoryStatus.INACTIVE,
      },
    })

    await auditLogger.log({
      companyId,
      userId: actorUserId,
      action: AuditAction.DELETE,
      entity: 'Category',
      entityId: categoryId,
      oldValue,
      newValue: { deletedAt: deletedAt.toISOString(), status: CategoryStatus.INACTIVE },
      ...auditContext,
    })
  }

  private async findActiveCategoryInCompany(companyId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        companyId,
        deletedAt: null,
      },
    })

    if (!category) {
      throw new AppError('Category not found', 404)
    }

    return category
  }

  private toResponse(category: {
    id: string
    companyId: string
    name: string
    description: string | null
    status: CategoryStatus
    createdAt: Date
    updatedAt: Date
  }): CategoryResponseDto {
    return {
      id: category.id,
      companyId: category.companyId,
      name: category.name,
      description: category.description,
      status: category.status,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }
  }
}
