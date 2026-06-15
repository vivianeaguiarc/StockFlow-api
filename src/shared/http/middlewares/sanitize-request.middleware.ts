import type { NextFunction, Request, Response } from 'express'

import { sanitizeInputValue, sanitizeTextValue } from '../../security/sanitize-input.js'

function sanitizeObjectInPlace(value: Record<string, unknown>): void {
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string') {
      value[key] = sanitizeTextValue(item)
      continue
    }

    if (Array.isArray(item)) {
      value[key] = item.map((entry) => sanitizeInputValue(entry))
      continue
    }

    if (item !== null && typeof item === 'object') {
      sanitizeObjectInPlace(item as Record<string, unknown>)
    }
  }
}

export function sanitizeRequestMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.body !== undefined && req.body !== null && typeof req.body === 'object') {
    req.body = sanitizeInputValue(req.body)
  }

  if (req.query !== undefined && req.query !== null && typeof req.query === 'object') {
    sanitizeObjectInPlace(req.query as Record<string, unknown>)
  }

  next()
}
