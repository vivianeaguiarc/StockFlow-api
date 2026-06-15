import { describe, expect, it } from 'vitest'

import { sanitizeLogData } from '../../src/shared/logger/logger.js'

describe('sanitizeLogData', () => {
  it('removes password and token fields from objects', () => {
    const sanitized = sanitizeLogData({
      email: 'user@example.com',
      password: 'super-secret',
      accessToken: 'jwt-access',
      refreshToken: 'jwt-refresh',
      token: 'bearer-token',
      secret: 'api-secret',
      authorization: 'Bearer xyz',
    }) as Record<string, unknown>

    expect(sanitized).toEqual({ email: 'user@example.com' })
    expect(sanitized).not.toHaveProperty('password')
    expect(sanitized).not.toHaveProperty('accessToken')
    expect(sanitized).not.toHaveProperty('refreshToken')
    expect(sanitized).not.toHaveProperty('token')
    expect(sanitized).not.toHaveProperty('secret')
    expect(sanitized).not.toHaveProperty('authorization')
  })

  it('sanitizes nested objects and arrays', () => {
    const sanitized = sanitizeLogData({
      user: { name: 'Alice', passwordHash: 'hashed' },
      items: [{ refreshToken: 'rt' }, { label: 'ok' }],
    }) as Record<string, unknown>

    expect(sanitized).toEqual({
      user: { name: 'Alice' },
      items: [{}, { label: 'ok' }],
    })
  })
})
