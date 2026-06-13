import type { NextFunction, Request, Response } from 'express'

import { getAuditContext } from '../../../shared/audit/audit-context.js'
import { AppError } from '../../../shared/errors/AppError.js'
import type { LoginDto } from '../dtos/login.dto.js'
import type { RegisterCompanyDto } from '../dtos/register-company.dto.js'
import type { AuthService } from '../services/AuthService.js'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as RegisterCompanyDto
      const result = await this.authService.register(data)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as LoginDto
      const result = await this.authService.login(data, getAuditContext(req))
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  me(req: Request, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      res.status(200).json({
        id: req.user.id,
        companyId: req.user.companyId,
        email: req.user.email,
        role: req.user.role,
      })
    } catch (error) {
      next(error)
    }
  }

  adminOnly(req: Request, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      res.status(200).json({
        message: 'Admin access granted',
        role: req.user.role,
      })
    } catch (error) {
      next(error)
    }
  }

  management(req: Request, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      res.status(200).json({
        message: 'Management access granted',
        role: req.user.role,
      })
    } catch (error) {
      next(error)
    }
  }
}
