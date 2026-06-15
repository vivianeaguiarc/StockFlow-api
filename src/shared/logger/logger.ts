import pino from 'pino'

import { env } from '../../config/env.js'

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'accessToken',
  'refreshToken',
  'token',
  'secret',
  'authorization',
])

function resolveLogLevel(): pino.LevelWithSilent {
  if (env.NODE_ENV === 'test') {
    return 'silent'
  }

  if (env.NODE_ENV === 'production') {
    return 'info'
  }

  return 'debug'
}

export function sanitizeLogData(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogData(item))
  }

  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {}

    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key)) {
        continue
      }

      sanitized[key] = sanitizeLogData(item)
    }

    return sanitized
  }

  return value
}

export const logger = pino({
  level: resolveLogLevel(),
  base: { service: 'stockflow-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
})

export function createChildLogger(bindings: Record<string, unknown>): pino.Logger {
  return logger.child(sanitizeLogData(bindings) as pino.Bindings)
}

export function logInfo(data: Record<string, unknown>, message: string): void {
  logger.info(sanitizeLogData(data) as Record<string, unknown>, message)
}

export function logWarn(data: Record<string, unknown>, message: string): void {
  logger.warn(sanitizeLogData(data) as Record<string, unknown>, message)
}

export function logError(data: Record<string, unknown>, message: string): void {
  logger.error(sanitizeLogData(data) as Record<string, unknown>, message)
}

export function logDebug(data: Record<string, unknown>, message: string): void {
  logger.debug(sanitizeLogData(data) as Record<string, unknown>, message)
}
