import type { Prisma } from '@prisma/client'

const SENSITIVE_KEYS = new Set(['password', 'passwordHash', 'accessToken', 'refreshToken', 'token'])

export function sanitizeAuditData(value: unknown): Prisma.InputJsonValue {
  if (value === null || value === undefined) {
    return null as unknown as Prisma.InputJsonValue
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditData(item))
  }

  if (typeof value === 'object') {
    const sanitized: Record<string, Prisma.InputJsonValue> = {}

    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key)) {
        continue
      }

      sanitized[key] = sanitizeAuditData(item)
    }

    return sanitized
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  return String(value)
}
