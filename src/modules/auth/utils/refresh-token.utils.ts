import { createHash, randomBytes } from 'node:crypto'

import { getJwtRefreshSecret } from '../../../config/production-secrets.js'

export function generateRefreshTokenValue(): string {
  return randomBytes(48).toString('base64url')
}

export function hashRefreshToken(token: string): string {
  const pepper = getJwtRefreshSecret()
  const material = pepper ? `${pepper}:${token}` : token

  return createHash('sha256').update(material).digest('hex')
}
