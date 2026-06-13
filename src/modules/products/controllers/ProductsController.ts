import type { NextFunction, Request, Response } from 'express'

import { getAuditContext } from '../../../shared/audit/audit-context.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { paginationSchema } from '../../../shared/utils/pagination.js'
import type { CreateProductDto } from '../dtos/create-product.dto.js'
import type { UpdateProductDto } from '../dtos/update-product.dto.js'
import type { ProductsService } from '../services/ProductsService.js'

export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as CreateProductDto
      const product = await this.productsService.create(
        req.user.companyId,
        req.user.id,
        data,
        getAuditContext(req),
      )
      res.status(201).json(product)
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
      const result = await this.productsService.list(req.user.companyId, pagination)
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

      const product = await this.productsService.getById(
        req.user.companyId,
        req.params['id'] as string,
      )
      res.status(200).json(product)
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as UpdateProductDto
      const product = await this.productsService.update(
        req.user.companyId,
        req.user.id,
        req.params['id'] as string,
        data,
        getAuditContext(req),
      )
      res.status(200).json(product)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      await this.productsService.delete(
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
