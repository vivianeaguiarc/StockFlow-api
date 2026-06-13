import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../../src/app.js'

const app = createApp()

describe('Root endpoint', () => {
  it('GET / returns API metadata and useful links', async () => {
    const response = await request(app).get('/').expect(200)

    expect(response.body).toMatchObject({
      name: 'StockFlow API',
      status: 'running',
      version: '1.0.0',
      environment: 'test',
      links: {
        docs: '/api/docs',
        health: '/api/v1/health/live',
        ready: '/api/v1/health/ready',
      },
    })
  })

  it('HEAD / returns 200', async () => {
    await request(app).head('/').expect(200)
  })
})
