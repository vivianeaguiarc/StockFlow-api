import type { UserRole } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'

import { AppError } from '../../errors/AppError.js'

const UNAUTHORIZED_MESSAGE = 'Unauthorized'
const FORBIDDEN_MESSAGE = 'Forbidden'

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(UNAUTHORIZED_MESSAGE, 401))
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(FORBIDDEN_MESSAGE, 403))
      return
    }

    next()
  }
}

/** Alias for authorizeRoles — restricts access to the given roles. */
export const ensureRole = authorizeRoles
