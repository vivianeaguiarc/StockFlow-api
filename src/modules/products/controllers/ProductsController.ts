import type { NextFunction, Request, Response } from 'express'

import { getAuditContext } from '../../../shared/audit/audit-context.js'
import { AppError } from '../../../shared/errors/AppError.js'
import {
  paginatedResponse,
  sendCreated,
  sendNoContent,
  successResponse,
} from '../../../shared/http/response.js'
import type { CreateProductDto } from '../dtos/create-product.dto.js'
import type { ListLowStockProductsQuery } from '../dtos/list-low-stock-products-query.dto.js'
import type { ListProductsQuery } from '../dtos/list-products-query.dto.js'
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
      sendCreated(res, product, 'Product created successfully')
    } catch (error) {
      next(error)
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const query = req.query as unknown as ListProductsQuery
      const result = await this.productsService.list(req.user.companyId, query)
      paginatedResponse(res, result, 'Products retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  async listLowStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const query = req.query as unknown as ListLowStockProductsQuery
      const result = await this.productsService.listLowStock(req.user.companyId, query)
      paginatedResponse(res, result, 'Low stock products retrieved successfully')
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
      successResponse(res, product, 'Product retrieved successfully')
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
      successResponse(res, product, 'Product updated successfully')
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
      sendNoContent(res)
    } catch (error) {
      next(error)
    }
  }
}
