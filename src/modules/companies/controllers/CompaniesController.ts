import type { NextFunction, Request, Response } from 'express'

import { getAuditContext } from '../../../shared/audit/audit-context.js'
import { AppError } from '../../../shared/errors/AppError.js'
import {
  paginatedResponse,
  sendCreated,
  sendNoContent,
  successResponse,
} from '../../../shared/http/response.js'
import type { CreateCompanyDto } from '../dtos/create-company.dto.js'
import type { ListCompaniesQuery } from '../dtos/list-companies-query.dto.js'
import type { UpdateCompanyDto } from '../dtos/update-company.dto.js'
import type { UpdateCompanyCrudDto } from '../dtos/update-company-crud.dto.js'
import type { CompaniesService } from '../services/CompaniesService.js'

export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as CreateCompanyDto
      const company = await this.companiesService.create(
        req.user.id,
        req.user.companyId,
        data,
        getAuditContext(req),
      )

      sendCreated(res, company, 'Company created successfully')
    } catch (error) {
      next(error)
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const query = req.query as unknown as ListCompaniesQuery
      const result = await this.companiesService.list(req.user.companyId, query)
      paginatedResponse(res, result, 'Companies retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const company = await this.companiesService.getById(
        req.user.companyId,
        req.params['id'] as string,
      )
      successResponse(res, company, 'Company retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  async updateById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as UpdateCompanyCrudDto
      const company = await this.companiesService.updateById(
        req.user.companyId,
        req.user.id,
        req.params['id'] as string,
        data,
        getAuditContext(req),
      )

      successResponse(res, company, 'Company updated successfully')
    } catch (error) {
      next(error)
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      await this.companiesService.deleteById(
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

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const company = await this.companiesService.getProfile(req.user.companyId)
      successResponse(res, company, 'Company profile retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const data = req.body as UpdateCompanyDto
      const company = await this.companiesService.updateProfile(
        req.user.companyId,
        req.user.id,
        data,
        getAuditContext(req),
      )

      successResponse(res, company, 'Company profile updated successfully')
    } catch (error) {
      next(error)
    }
  }
}
