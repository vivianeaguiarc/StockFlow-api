import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../../src/app.js'

const app = createApp()

describe('GET /api/health', () => {
  it('returns 200 and health payload', async () => {
    const response = await request(app).get('/api/health').expect(200)

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'StockFlow API',
    })
    expect(typeof response.body.timestamp).toBe('string')
  })
})
