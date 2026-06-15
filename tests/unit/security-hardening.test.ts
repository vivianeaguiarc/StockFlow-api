import type { Request } from 'express'
import { describe, expect, it } from 'vitest'

import {
  buildLoginRateLimitKey,
  buildRefreshRateLimitKey,
} from '../../src/shared/security/rate-limit.js'
import { isOriginAllowed, parseCorsOrigins } from '../../src/shared/security/cors.js'
import { sanitizeInputValue, sanitizeTextValue } from '../../src/shared/security/sanitize-input.js'

describe('security helpers', () => {
  it('parses comma-separated CORS origins', () => {
    expect(parseCorsOrigins('https://a.com, https://b.com')).toEqual([
      'https://a.com',
      'https://b.com',
    ])
  })

  it('blocks unknown origins in production allow-list', () => {
    const allowed = ['https://app.stockflow.com']

    expect(isOriginAllowed('https://app.stockflow.com', allowed)).toBe(true)
    expect(isOriginAllowed('https://evil.example.com', allowed)).toBe(false)
    expect(isOriginAllowed(undefined, allowed)).toBe(true)
  })

  it('builds login rate-limit key using IP and email', () => {
    const key = buildLoginRateLimitKey({
      ip: '127.0.0.1',
      body: { email: 'Admin@Example.com' },
    } as Request)

    expect(key).toBe('login:127.0.0.1:admin@example.com')
  })

  it('builds refresh rate-limit key using IP', () => {
    const key = buildRefreshRateLimitKey({ ip: '10.0.0.5' } as Request)
    expect(key).toBe('refresh:10.0.0.5')
  })

  it('sanitizes dangerous strings without removing safe text', () => {
    expect(sanitizeTextValue('  Hello World  ')).toBe('Hello World')
    expect(sanitizeTextValue('<script>alert(1)</script>John')).toBe('John')
    expect(sanitizeTextValue('javascript:alert(1)')).toBe('alert(1)')
  })

  it('sanitizes nested request payloads', () => {
    const sanitized = sanitizeInputValue({
      name: '<script>x</script>Maria',
      nested: { note: 'javascript:evil' },
    }) as Record<string, unknown>

    expect(sanitized.name).toBe('Maria')
    expect((sanitized.nested as Record<string, string>).note).toBe('evil')
  })
})
