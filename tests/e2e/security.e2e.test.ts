import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../../src/app.js'
import { apiPath } from '../helpers/api-paths.js'
import { createInvalidAccessToken } from '../helpers/factories/token.factory.js'

const app = createApp()

describe('Security hardening (e2e)', () => {
  it('returns security headers from Helmet', async () => {
    const response = await request(app).get(apiPath('/health')).expect(200)

    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['x-frame-options']).toBeDefined()
    expect(response.headers['x-request-id']).toBeDefined()
  })

  it('rejects payloads above 1mb with 413', async () => {
    const oversizedPayload = {
      email: 'a@example.com',
      password: 'x'.repeat(1_100_000),
    }

    const response = await request(app)
      .post(apiPath('/auth/login'))
      .send(oversizedPayload)
      .expect(413)

    expect(response.body).toMatchObject({
      success: false,
      message: 'Payload too large',
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        details: [],
      },
    })
    expect(response.body.requestId).toBeDefined()
  })

  it('returns safe unauthorized response for invalid JWT', async () => {
    const response = await request(app)
      .get(apiPath('/auth/me'))
      .set('Authorization', `Bearer ${createInvalidAccessToken()}`)
      .expect(401)

    expect(response.body).toMatchObject({
      success: false,
      message: 'Unauthorized',
      error: {
        code: 'UNAUTHORIZED',
        details: [],
      },
    })
    expect(response.body).not.toHaveProperty('stack')
    expect(response.body).not.toHaveProperty('password')
    expect(response.body.requestId).toBeDefined()
  })
})
