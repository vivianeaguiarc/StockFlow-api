import type { NextFunction, Request, Response } from 'express'

import { getAuditContext } from '../../../shared/audit/audit-context.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { sendCreated, sendNoContent, successResponse } from '../../../shared/http/response.js'
import type { LoginDto } from '../dtos/login.dto.js'
import type { LogoutDto, RefreshTokenDto } from '../dtos/refresh-token.dto.js'
import type { RegisterCompanyDto } from '../dtos/register-company.dto.js'
import type { AuthService } from '../services/AuthService.js'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as RegisterCompanyDto
      const result = await this.authService.register(data)
      sendCreated(res, result, 'Company registered successfully')
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as LoginDto
      const result = await this.authService.login(data, getAuditContext(req))
      successResponse(res, result, 'Login successful')
    } catch (error) {
      next(error)
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as RefreshTokenDto
      const result = await this.authService.refresh(data, getAuditContext(req))
      successResponse(res, result, 'Token refreshed successfully')
    } catch (error) {
      next(error)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as LogoutDto
      await this.authService.logout(data, getAuditContext(req))
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

      const profile = await this.authService.getMe(req.user.id)
      successResponse(res, profile, 'Authenticated user retrieved successfully')
    } catch (error) {
      next(error)
    }
  }

  me(req: Request, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      successResponse(
        res,
        {
          id: req.user.id,
          companyId: req.user.companyId,
          email: req.user.email,
          role: req.user.role,
        },
        'Current user claims retrieved successfully',
      )
    } catch (error) {
      next(error)
    }
  }

  adminOnly(req: Request, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      successResponse(
        res,
        {
          message: 'Admin access granted',
          role: req.user.role,
        },
        'Admin access granted',
      )
    } catch (error) {
      next(error)
    }
  }

  management(req: Request, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401)
      }

      successResponse(
        res,
        {
          message: 'Management access granted',
          role: req.user.role,
        },
        'Management access granted',
      )
    } catch (error) {
      next(error)
    }
  }
}
