import type { NextFunction, Request, Response } from 'express'

import { AppError } from '../../../shared/errors/AppError.js'
import { paginationSchema } from '../../../shared/utils/pagination.js'
import type { CreateCategoryDto } from '../dtos/create-category.dto.js'
import type { UpdateCategoryDto } from '../dtos/update-category.dto.js'
import type { CategoriesService } from '../services/CategoriesService.js'

export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as CreateCategoryDto
      const category = await this.categoriesService.create(req.user.companyId, data)
      res.status(201).json(category)
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
      const result = await this.categoriesService.list(req.user.companyId, pagination)
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

      const category = await this.categoriesService.getById(
        req.user.companyId,
        req.params['id'] as string,
      )
      res.status(200).json(category)
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as UpdateCategoryDto
      const category = await this.categoriesService.update(
        req.user.companyId,
        req.params['id'] as string,
        data,
      )
      res.status(200).json(category)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      await this.categoriesService.delete(req.user.companyId, req.params['id'] as string)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
