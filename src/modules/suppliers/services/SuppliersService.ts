import { Prisma, SupplierStatus } from '@prisma/client'

import { prisma } from '../../../shared/database/prisma.js'
import { AppError } from '../../../shared/errors/AppError.js'
import {
  buildPaginationMeta,
  getPaginationOffset,
  type PaginationParams,
} from '../../../shared/utils/pagination.js'
import type { CreateSupplierDto } from '../dtos/create-supplier.dto.js'
import type {
  PaginatedSuppliersResponseDto,
  SupplierResponseDto,
} from '../dtos/supplier-response.dto.js'
import type { UpdateSupplierDto } from '../dtos/update-supplier.dto.js'

export class SuppliersService {
  async create(companyId: string, data: CreateSupplierDto): Promise<SupplierResponseDto> {
    try {
      const supplier = await prisma.supplier.create({
        data: {
          companyId,
          corporateName: data.corporateName,
          tradeName: data.tradeName,
          document: data.document,
          email: data.email ?? null,
          phone: data.phone ?? null,
        },
      })

      return this.toResponse(supplier)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(this.getDuplicateMessage(error), 409)
      }

      throw error
    }
  }

  async list(
    companyId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedSuppliersResponseDto> {
    const { page, limit } = pagination
    const offset = getPaginationOffset(page, limit)

    const where = {
      companyId,
      deletedAt: null,
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { corporateName: 'asc' },
      }),
      prisma.supplier.count({ where }),
    ])

    return {
      data: suppliers.map((supplier) => this.toResponse(supplier)),
      meta: buildPaginationMeta(page, limit, total),
    }
  }

  async getById(companyId: string, supplierId: string): Promise<SupplierResponseDto> {
    const supplier = await this.findActiveSupplierInCompany(companyId, supplierId)
    return this.toResponse(supplier)
  }

  async update(
    companyId: string,
    supplierId: string,
    data: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    await this.findActiveSupplierInCompany(companyId, supplierId)

    try {
      const updated = await prisma.supplier.update({
        where: { id: supplierId },
        data: {
          ...(data.corporateName !== undefined && { corporateName: data.corporateName }),
          ...(data.tradeName !== undefined && { tradeName: data.tradeName }),
          ...(data.document !== undefined && { document: data.document }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.status !== undefined && { status: data.status }),
        },
      })

      return this.toResponse(updated)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(this.getDuplicateMessage(error), 409)
      }

      throw error
    }
  }

  async delete(companyId: string, supplierId: string): Promise<void> {
    await this.findActiveSupplierInCompany(companyId, supplierId)

    await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        deletedAt: new Date(),
        status: SupplierStatus.INACTIVE,
      },
    })
  }

  private async findActiveSupplierInCompany(companyId: string, supplierId: string) {
    const supplier = await prisma.supplier.findFirst({
      where: {
        id: supplierId,
        companyId,
        deletedAt: null,
      },
    })

    if (!supplier) {
      throw new AppError('Supplier not found', 404)
    }

    return supplier
  }

  private getDuplicateMessage(error: Prisma.PrismaClientKnownRequestError): string {
    const target = error.meta?.['target']

    if (Array.isArray(target) && target.includes('document')) {
      return 'Supplier document already exists for this company'
    }

    if (Array.isArray(target) && target.some((field) => field.includes('email'))) {
      return 'Supplier email already exists for this company'
    }

    return 'Supplier already exists for this company'
  }

  private toResponse(supplier: {
    id: string
    companyId: string
    corporateName: string
    tradeName: string
    document: string
    email: string | null
    phone: string | null
    status: SupplierStatus
    createdAt: Date
    updatedAt: Date
  }): SupplierResponseDto {
    return {
      id: supplier.id,
      companyId: supplier.companyId,
      corporateName: supplier.corporateName,
      tradeName: supplier.tradeName,
      document: supplier.document,
      email: supplier.email,
      phone: supplier.phone,
      status: supplier.status,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    }
  }
}
