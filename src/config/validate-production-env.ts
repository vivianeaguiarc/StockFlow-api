import { env } from './env.js'

const MIN_JWT_SECRET_LENGTH = 32

export function validateProductionEnv(): void {
  if (env.NODE_ENV !== 'production') {
    return
  }

  if (!env.JWT_SECRET || env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH) {
    console.error(
      `JWT_SECRET is required in production and must be at least ${MIN_JWT_SECRET_LENGTH} characters`,
    )
    process.exit(1)
  }

  if (!env.DATABASE_URL) {
    console.error('DATABASE_URL is required in production')
    process.exit(1)
  }

  if (!env.CORS_ORIGINS) {
    console.warn(
      'CORS_ORIGINS is not set in production — cross-origin browser requests from unknown origins will be blocked',
    )
  }
}
