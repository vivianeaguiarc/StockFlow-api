import type { NextFunction, Request, Response } from 'express'

import { getAuditContext } from '../../../shared/audit/audit-context.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { paginationSchema } from '../../../shared/utils/pagination.js'
import type { CreateUserDto } from '../dtos/create-user.dto.js'
import type { UpdateUserDto } from '../dtos/update-user.dto.js'
import type { UsersService } from '../services/UsersService.js'

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as CreateUserDto
      const user = await this.usersService.create(
        req.user.companyId,
        req.user.id,
        data,
        getAuditContext(req),
      )
      res.status(201).json(user)
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
      const result = await this.usersService.list(req.user.companyId, pagination)
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

      const user = await this.usersService.getById(req.user.companyId, req.params['id'] as string)
      res.status(200).json(user)
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as UpdateUserDto
      const user = await this.usersService.update(
        req.user.companyId,
        req.user.id,
        req.params['id'] as string,
        data,
        getAuditContext(req),
      )
      res.status(200).json(user)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      await this.usersService.delete(
        req.user.companyId,
        req.user.id,
        req.params['id'] as string,
        req.user.id,
        getAuditContext(req),
      )
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
