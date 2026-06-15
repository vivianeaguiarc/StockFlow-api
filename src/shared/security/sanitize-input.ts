const DANGEROUS_PROTOCOL_PATTERN = /^javascript:/i
const SCRIPT_TAG_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi

export function sanitizeTextValue(value: string): string {
  return value.replace(SCRIPT_TAG_PATTERN, '').replace(DANGEROUS_PROTOCOL_PATTERN, '').trim()
}

export function sanitizeInputValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return sanitizeTextValue(value)
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeInputValue(item))
  }

  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {}

    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      sanitized[key] = sanitizeInputValue(item)
    }

    return sanitized
  }

  return value
}
