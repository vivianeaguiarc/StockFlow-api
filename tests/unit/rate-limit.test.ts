import type { Request } from 'express'
import express from 'express'
import rateLimit from 'express-rate-limit'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

import {
  isRateLimitEnabled,
  RATE_LIMIT_MESSAGE,
  shouldSkipGlobalRateLimit,
} from '../../src/shared/security/rate-limit.js'

describe('rate limit helpers', () => {
  it('disables rate limiting in test environment by default', () => {
    expect(isRateLimitEnabled()).toBe(false)
  })

  it('skips swagger paths on global limiter', () => {
    expect(
      shouldSkipGlobalRateLimit({
        path: '/api/docs',
        originalUrl: '/api/docs',
      } as Request),
    ).toBe(true)

    expect(
      shouldSkipGlobalRateLimit({
        path: '/api/docs/',
        originalUrl: '/api/docs/swagger-ui.css',
      } as Request),
    ).toBe(true)

    expect(
      shouldSkipGlobalRateLimit({
        path: '/api/health',
        originalUrl: '/api/health',
      } as Request),
    ).toBe(true)

    expect(
      shouldSkipGlobalRateLimit({
        path: '/api/v1/ready',
        originalUrl: '/api/v1/ready',
      } as Request),
    ).toBe(true)
  })
})

describe('rate limit response', () => {
  it('returns 429 with standard error body', async () => {
    const app = express()

    app.use(
      rateLimit({
        windowMs: 60_000,
        max: 1,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req, res, _next, options) => {
          res.status(options.statusCode).json({
            status: 'error',
            message: RATE_LIMIT_MESSAGE,
          })
        },
      }),
    )

    app.get('/test', (_req, res) => {
      res.sendStatus(200)
    })

    await request(app).get('/test').expect(200)

    const blocked = await request(app).get('/test').expect(429)

    expect(blocked.body).toEqual({
      status: 'error',
      message: 'Too many requests',
    })
  })
})
