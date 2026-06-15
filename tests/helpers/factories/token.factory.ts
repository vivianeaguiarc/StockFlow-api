import jwt from 'jsonwebtoken'

import { getJwtAccessSecret } from '../../../src/config/production-secrets.js'

type AccessTokenPayload = {
  userId: string
  companyId: string
  role: string
}

export function createAccessToken(
  payload: AccessTokenPayload,
  options?: { secret?: string; expiresIn?: string },
): string {
  const secret = options?.secret ?? getJwtAccessSecret()

  if (!secret) {
    throw new Error('JWT access secret is not configured')
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
