import { env } from './env.js'

export function getJwtAccessSecret(): string | undefined {
  return env.JWT_ACCESS_SECRET ?? env.JWT_SECRET
}

export function getJwtRefreshSecret(): string | undefined {
  return env.JWT_REFRESH_SECRET
}

export function getCorsOriginsRaw(): string | undefined {
  return env.CORS_ORIGINS ?? env.CORS_ORIGIN
}
