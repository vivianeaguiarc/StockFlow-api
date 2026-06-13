import { CategoryStatus, Prisma } from '@prisma/client'

import { prisma } from '../../../shared/database/prisma.js'
import { AppError } from '../../../shared/errors/AppError.js'
import {
  buildPaginationMeta,
  getPaginationOffset,
  type PaginationParams,
} from '../../../shared/utils/pagination.js'
import type {
  CategoryResponseDto,
  PaginatedCategoriesResponseDto,
} from '../dtos/category-response.dto.js'
import type { CreateCategoryDto } from '../dtos/create-category.dto.js'
import type { UpdateCategoryDto } from '../dtos/update-category.dto.js'

export class CategoriesService {
  async create(companyId: string, data: CreateCategoryDto): Promise<CategoryResponseDto> {
    try {
      const category = await prisma.category.create({
        data: {
          companyId,
          name: data.name,
          description: data.description ?? null,
        },
      })

      return this.toResponse(category)
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
    categoryId: string,
    data: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    await this.findActiveCategoryInCompany(companyId, categoryId)

    try {
      const updated = await prisma.category.update({
        where: { id: categoryId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.status !== undefined && { status: data.status }),
        },
      })

      return this.toResponse(updated)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Category name already exists for this company', 409)
      }

      throw error
    }
  }

  async delete(companyId: string, categoryId: string): Promise<void> {
    await this.findActiveCategoryInCompany(companyId, categoryId)

    await prisma.category.update({
      where: { id: categoryId },
      data: {
        deletedAt: new Date(),
        status: CategoryStatus.INACTIVE,
      },
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
