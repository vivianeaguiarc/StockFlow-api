import express from 'express'
import request from 'supertest'
import rateLimit from 'express-rate-limit'
import { describe, expect, it } from 'vitest'

import { buildLoginRateLimitKey, RATE_LIMIT_MESSAGE } from '../../src/shared/security/rate-limit.js'

describe('login rate limit', () => {
  it('blocks repeated login attempts with 429', async () => {
    const app = express()
    app.use(express.json())

    app.post(
      '/login',
      rateLimit({
        windowMs: 60_000,
        max: 2,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: buildLoginRateLimitKey,
        handler: (_req, res, _next, options) => {
          res.status(options.statusCode).json({
            status: 'error',
            message: RATE_LIMIT_MESSAGE,
          })
        },
      }),
      (_req, res) => {
        res.status(401).json({ status: 'error', message: 'Invalid email or password' })
      },
    )

    const credentials = { email: 'user@example.com', password: 'wrong' }

    await request(app).post('/login').send(credentials).expect(401)
    await request(app).post('/login').send(credentials).expect(401)

    const blocked = await request(app).post('/login').send(credentials).expect(429)

    expect(blocked.body).toEqual({
      status: 'error',
      message: RATE_LIMIT_MESSAGE,
    })
  })
})
