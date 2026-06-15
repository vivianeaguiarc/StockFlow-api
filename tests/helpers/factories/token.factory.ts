import jwt from 'jsonwebtoken'

import { env } from '../../../src/config/env.js'

type AccessTokenPayload = {
  userId: string
  companyId: string
  role: string
}

export function createAccessToken(
  payload: AccessTokenPayload,
  options?: { secret?: string; expiresIn?: string },
): string {
  const secret = options?.secret ?? env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.sign(payload, secret, {
    expiresIn: options?.expiresIn ?? '15m',
  } as jwt.SignOptions)
}

export function createInvalidAccessToken(): string {
  return 'invalid.jwt.token'
}

export function createExpiredAccessToken(payload: AccessTokenPayload): string {
  return createAccessToken(payload, { expiresIn: '-1s' })
}
