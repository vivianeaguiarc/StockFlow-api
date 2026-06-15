import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

import { env } from '../../../config/env.js'
import { usersRepository } from '../../../modules/users/repositories/index.js'
import { AppError } from '../../errors/AppError.js'
import { JWT_ALGORITHM } from '../../security/rate-limit.js'

const UNAUTHORIZED_MESSAGE = 'Unauthorized'

const jwtPayloadSchema = z.object({
  userId: z.string(),
  companyId: z.string(),
  role: z.string(),
})

function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authorizationHeader.slice(7).trim()
  return token.length > 0 ? token : null
}

function getJwtSecret(): string {
  if (!env.JWT_SECRET) {
    throw new AppError('Internal server error', 500)
  }

  return env.JWT_SECRET
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization)

    if (!token) {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401)
    }

    let payload: z.infer<typeof jwtPayloadSchema>

    try {
      const decoded = jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] })
      payload = jwtPayloadSchema.parse(decoded)
    } catch {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401)
    }

    const user = await usersRepository.findActiveByIdWithCompany(payload.userId)

    if (!user || user.deletedAt !== null || user.company.deletedAt !== null) {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401)
    }

    if (user.status !== 'ACTIVE' || user.company.status !== 'ACTIVE') {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401)
    }

    if (user.companyId !== payload.companyId || user.role !== payload.role) {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401)
    }

    req.user = {
      id: user.id,
      companyId: user.companyId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    }

    next()
  } catch (error) {
    next(error)
  }
}
