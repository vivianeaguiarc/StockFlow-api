import type { NextFunction, Request, Response } from 'express'

import { getAuditContext } from '../../../shared/audit/audit-context.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { paginationSchema } from '../../../shared/utils/pagination.js'
import type { CreateSupplierDto } from '../dtos/create-supplier.dto.js'
import type { UpdateSupplierDto } from '../dtos/update-supplier.dto.js'
import type { SuppliersService } from '../services/SuppliersService.js'

export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as CreateSupplierDto
      const supplier = await this.suppliersService.create(
        req.user.companyId,
        req.user.id,
        data,
        getAuditContext(req),
      )
      res.status(201).json(supplier)
    } catch (error) {
      next(error)
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const pagination = paginationSchema.parse(req.query)
      const result = await this.suppliersService.list(req.user.companyId, pagination)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const supplier = await this.suppliersService.getById(
        req.user.companyId,
        req.params['id'] as string,
      )
      res.status(200).json(supplier)
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as UpdateSupplierDto
      const supplier = await this.suppliersService.update(
        req.user.companyId,
        req.user.id,
        req.params['id'] as string,
        data,
        getAuditContext(req),
      )
      res.status(200).json(supplier)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      await this.suppliersService.delete(
        req.user.companyId,
        req.user.id,
        req.params['id'] as string,
        getAuditContext(req),
      )
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
