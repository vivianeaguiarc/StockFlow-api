import jwt from 'jsonwebtoken'

import { getJwtAccessSecret } from '../../../src/config/production-secrets.js'

type AccessTokenPayload = {
  userId: string
  email: string
  companyId: string
  role: string
}

export function createAccessToken(
  payload: Partial<AccessTokenPayload> & Pick<AccessTokenPayload, 'userId' | 'companyId' | 'role'>,
  options?: { secret?: string; expiresIn?: string },
): string {
  const secret = options?.secret ?? getJwtAccessSecret()

  if (!secret) {
    throw new Error('JWT access secret is not configured')
  }

  return jwt.sign(
    {
      email: payload.email ?? 'user@example.com',
      ...payload,
    },
    secret,
    {
      expiresIn: options?.expiresIn ?? '15m',
    } as jwt.SignOptions,
  )
}

export function createInvalidAccessToken(): string {
  return 'invalid.jwt.token'
}

export function createExpiredAccessToken(
  payload: Partial<AccessTokenPayload> & Pick<AccessTokenPayload, 'userId' | 'companyId' | 'role'>,
): string {
  return createAccessToken(payload, { expiresIn: '-1s' })
}
