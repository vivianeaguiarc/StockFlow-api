import cors, { type CorsOptions } from 'cors'

import { env } from '../../config/env.js'

export function parseCorsOrigins(rawOrigins: string | undefined): string[] {
  if (!rawOrigins) {
    return []
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
}

export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) {
    return true
  }

  return allowedOrigins.includes(origin)
}

export function createCorsOptions(): CorsOptions {
  const allowedOrigins = parseCorsOrigins(env.CORS_ORIGINS)

  if (env.NODE_ENV === 'development' && allowedOrigins.length === 0) {
    return {
      origin: true,
      credentials: true,
    }
  }

  if (env.NODE_ENV === 'test') {
    return {
      origin: true,
      credentials: true,
    }
  }

  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true)
        return
      }

      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }
}

export function createCorsMiddleware() {
  return cors(createCorsOptions())
}
