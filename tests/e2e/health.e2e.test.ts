import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../../src/app.js'
import { apiPath } from '../helpers/api-paths.js'

const app = createApp()

describe('Health endpoints', () => {
  it('GET /api/v1/health returns basic payload', async () => {
    const response = await request(app).get(apiPath('/health')).expect(200)

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'StockFlow API',
    })
    expect(typeof response.body.timestamp).toBe('string')
  })

  it('keeps legacy /api/health available temporarily', async () => {
    const response = await request(app).get('/api/health').expect(200)

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'StockFlow API',
    })
  })

  it('GET /api/v1/health/live returns liveness payload', async () => {
    const response = await request(app).get(apiPath('/health/live')).expect(200)

    expect(response.body).toMatchObject({ status: 'ok' })
    expect(typeof response.body.timestamp).toBe('string')
  })

  it('GET /api/v1/health/ready returns readiness payload when database is available', async () => {
    const response = await request(app).get(apiPath('/health/ready')).expect(200)

    expect(response.body.status).toBe('ready')
    expect(response.body.services.database).toBe('up')
    expect(['up', 'down']).toContain(response.body.services.redis)
  })

  it('GET /api/v1/health/details returns detailed health payload', async () => {
    const response = await request(app).get(apiPath('/health/details')).expect(200)

    expect(response.body).toMatchObject({
      version: '1.0.0',
      environment: 'test',
    })
    expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.status)
    expect(typeof response.body.uptime).toBe('number')
    expect(response.body.services.database.status).toBe('up')
    expect(['up', 'down']).toContain(response.body.services.redis.status)
    expect(typeof response.body.timestamp).toBe('string')
  })
})
