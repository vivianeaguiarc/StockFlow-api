import type { NextFunction, Request, Response } from 'express'

import { AppError } from '../../../shared/errors/AppError.js'
import type { UpdateCompanyDto } from '../dtos/update-company.dto.js'
import type { CompaniesService } from '../services/CompaniesService.js'

export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      const company = await this.companiesService.getProfile(req.user.companyId)
      res.status(200).json(company)
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
      const company = await this.companiesService.updateProfile(req.user.companyId, data)
      res.status(200).json(company)
    } catch (error) {
      next(error)
    }
  }
}
