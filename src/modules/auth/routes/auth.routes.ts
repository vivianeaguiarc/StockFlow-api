import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'

import { authenticate } from '../../../shared/http/middlewares/authenticate.js'
import { authorizeRoles } from '../../../shared/http/middlewares/authorize-roles.js'
import { validateRequest } from '../../../shared/http/middlewares/validate-request.js'
import { loginRateLimiter, registerRateLimiter } from '../../../shared/security/rate-limit.js'
import { AuthController } from '../controllers/AuthController.js'
import { loginSchema } from '../dtos/login.dto.js'
import { logoutSchema, refreshTokenSchema } from '../dtos/refresh-token.dto.js'
import { registerCompanySchema } from '../dtos/register-company.dto.js'
import { AuthService } from '../services/AuthService.js'

function createAuthController(): AuthController {
  return new AuthController(new AuthService())
}

export function createAuthRoutes(): Router {
  const router = Router()
  const authController = createAuthController()

  router.post(
    '/register',
    registerRateLimiter,
    validateRequest(registerCompanySchema),
    (req, res, next) => authController.register(req, res, next),
  )

  router.post('/login', loginRateLimiter, validateRequest(loginSchema), (req, res, next) =>
    authController.login(req, res, next),
  )

  router.post('/refresh', validateRequest(refreshTokenSchema), (req, res, next) =>
    authController.refresh(req, res, next),
  )

  router.post('/logout', validateRequest(logoutSchema), (req, res, next) =>
    authController.logout(req, res, next),
  )

  router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next))

  return router
}

export function createMeRouteHandlers(): [
  typeof authenticate,
  (req: Request, res: Response, next: NextFunction) => void,
] {
  const authController = createAuthController()

  return [authenticate, (req, res, next) => authController.me(req, res, next)]
}

export function createAdminOnlyRouteHandlers(): [
  typeof authenticate,
  ReturnType<typeof authorizeRoles>,
  (req: Request, res: Response, next: NextFunction) => void,
] {
  const authController = createAuthController()

  return [
    authenticate,
    authorizeRoles('ADMIN'),
    (req, res, next) => authController.adminOnly(req, res, next),
  ]
}

export function createManagementRouteHandlers(): [
  typeof authenticate,
  ReturnType<typeof authorizeRoles>,
  (req: Request, res: Response, next: NextFunction) => void,
] {
  const authController = createAuthController()

  return [
    authenticate,
    authorizeRoles('ADMIN', 'MANAGER'),
    (req, res, next) => authController.management(req, res, next),
  ]
}
