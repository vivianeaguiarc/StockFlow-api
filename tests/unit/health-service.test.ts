import { describe, expect, it, vi } from 'vitest'

import { HealthDependencyChecker } from '../../src/modules/health/services/HealthDependencyChecker.js'
import { HealthService } from '../../src/modules/health/services/HealthService.js'

function createHealthService(services: { database: 'up' | 'down'; redis: 'up' | 'down' }) {
  const dependencyChecker = {
    checkAll: vi.fn().mockResolvedValue(services),
    checkDatabase: vi.fn().mockResolvedValue(services.database),
    checkRedis: vi.fn().mockResolvedValue(services.redis),
  } as unknown as HealthDependencyChecker

  return new HealthService(dependencyChecker)
}

describe('HealthService', () => {
  it('returns live payload without checking dependencies', () => {
    const service = createHealthService({ database: 'up', redis: 'up' })
    const live = service.getLive()

    expect(live).toMatchObject({ status: 'ok' })
    expect(typeof live.timestamp).toBe('string')
  })

  it('returns ready with 200 when database is up', async () => {
    const service = createHealthService({ database: 'up', redis: 'up' })
    const result = await service.getReady()

    expect(result.httpStatus).toBe(200)
    expect(result.body).toEqual({
      status: 'ready',
      services: { database: 'up', redis: 'up' },
    })
  })

  it('returns ready with 200 when only redis is down', async () => {
    const service = createHealthService({ database: 'up', redis: 'down' })
    const result = await service.getReady()

    expect(result.httpStatus).toBe(200)
    expect(result.body).toEqual({
      status: 'ready',
      services: { database: 'up', redis: 'down' },
    })
  })

  it('returns not_ready with 503 when database is down', async () => {
    const service = createHealthService({ database: 'down', redis: 'up' })
    const result = await service.getReady()

    expect(result.httpStatus).toBe(503)
    expect(result.body).toEqual({
      status: 'not_ready',
      services: { database: 'down', redis: 'up' },
    })
  })

  it('returns healthy details when all dependencies are up', async () => {
    const service = createHealthService({ database: 'up', redis: 'up' })
    const details = await service.getDetails()

    expect(details.status).toBe('healthy')
    expect(details.version).toBe('1.0.0')
    expect(details.environment).toBe('test')
    expect(typeof details.uptime).toBe('number')
    expect(details.services.database.status).toBe('up')
    expect(details.services.redis.status).toBe('up')
    expect(typeof details.timestamp).toBe('string')
  })

  it('returns degraded details when redis is down', async () => {
    const service = createHealthService({ database: 'up', redis: 'down' })
    const details = await service.getDetails()

    expect(details.status).toBe('degraded')
    expect(details.services.redis.status).toBe('down')
  })

  it('returns unhealthy details when database is down', async () => {
    const service = createHealthService({ database: 'down', redis: 'down' })
    const details = await service.getDetails()

    expect(details.status).toBe('unhealthy')
    expect(details.services.database.status).toBe('down')
  })
})
