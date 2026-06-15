import { env } from './env.js'
import { getCorsOriginsRaw, getJwtAccessSecret, getJwtRefreshSecret } from './production-secrets.js'

const MIN_SECRET_LENGTH = 32

export function validateProductionEnv(): void {
  if (env.NODE_ENV !== 'production') {
    return
  }

  const accessSecret = getJwtAccessSecret()

  if (!accessSecret || accessSecret.length < MIN_SECRET_LENGTH) {
    console.error(
      `JWT_ACCESS_SECRET (or JWT_SECRET) is required in production and must be at least ${MIN_SECRET_LENGTH} characters`,
    )
    process.exit(1)
  }

  const refreshSecret = getJwtRefreshSecret()

  if (!refreshSecret || refreshSecret.length < MIN_SECRET_LENGTH) {
    console.error(
      `JWT_REFRESH_SECRET is required in production and must be at least ${MIN_SECRET_LENGTH} characters`,
    )
    process.exit(1)
  }

  if (!env.DATABASE_URL) {
    console.error('DATABASE_URL is required in production')
    process.exit(1)
  }

  if (env.CACHE_ENABLED !== false && !env.REDIS_URL) {
    console.error('REDIS_URL is required in production when CACHE_ENABLED is true')
    process.exit(1)
  }

  if (!getCorsOriginsRaw()) {
    console.warn(
      'CORS_ORIGINS (or CORS_ORIGIN) is not set in production — cross-origin browser requests from unknown origins will be blocked',
    )
  }
}
