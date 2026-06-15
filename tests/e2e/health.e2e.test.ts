import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../../src/app.js'
import { apiPath } from '../helpers/api-paths.js'

const app = createApp()

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('Health endpoints', () => {
  it('GET /api/v1/health returns basic payload', async () => {
    const response = await request(app).get(apiPath('/health')).expect(200)

    expect(response.body.data).toMatchObject({
      status: 'ok',
      environment: 'test',
    })
    expect(typeof response.body.data.timestamp).toBe('string')
    expect(typeof response.body.data.uptime).toBe('number')
    expect(response.body.data.uptime).toBeGreaterThanOrEqual(0)
    expect(response.headers['x-request-id']).toMatch(UUID_PATTERN)
  })

  it('GET /api/v1/ready returns readiness payload when database is available', async () => {
    const response = await request(app).get(apiPath('/ready')).expect(200)

    expect(response.body.data.status).toBe('ready')
    expect(response.body.data.services.database).toBe('up')
    expect(['up', 'down']).toContain(response.body.data.services.redis)
    expect(response.headers['x-request-id']).toMatch(UUID_PATTERN)
  })

  it('preserves incoming x-request-id header', async () => {
    const incomingId = '550e8400-e29b-41d4-a716-446655440000'

    const response = await request(app)
      .get(apiPath('/health'))
      .set('x-request-id', incomingId)
      .expect(200)

    expect(response.headers['x-request-id']).toBe(incomingId)
  })

  it('keeps legacy /api/health available temporarily', async () => {
    const response = await request(app).get('/api/health').expect(200)

    expect(response.body.data).toMatchObject({
      status: 'ok',
      environment: 'test',
    })
  })

  it('GET /api/v1/health/live returns liveness payload', async () => {
    const response = await request(app).get(apiPath('/health/live')).expect(200)

    expect(response.body.data).toMatchObject({ status: 'ok' })
    expect(typeof response.body.data.timestamp).toBe('string')
  })

  it('GET /api/v1/health/ready returns readiness payload when database is available', async () => {
    const response = await request(app).get(apiPath('/health/ready')).expect(200)

    expect(response.body.data.status).toBe('ready')
    expect(response.body.data.services.database).toBe('up')
    expect(['up', 'down']).toContain(response.body.data.services.redis)
  })

  it('GET /api/v1/health/details returns detailed health payload', async () => {
    const response = await request(app).get(apiPath('/health/details')).expect(200)

    expect(response.body.data).toMatchObject({
      version: '1.0.0',
      environment: 'test',
    })
    expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.data.status)
    expect(typeof response.body.data.uptime).toBe('number')
    expect(response.body.data.services.database.status).toBe('up')
    expect(['up', 'down']).toContain(response.body.data.services.redis.status)
    expect(typeof response.body.data.timestamp).toBe('string')
  })
})
