import { afterEach, describe, expect, it, vi } from 'vitest'

const MIN_SECRET = 'a'.repeat(32)

vi.mock('../../src/config/env.js', () => ({
  env: {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    CACHE_ENABLED: true,
    REDIS_URL: 'redis://localhost:6379',
  },
}))

vi.mock('../../src/config/production-secrets.js', () => ({
  getJwtAccessSecret: vi.fn(() => MIN_SECRET),
  getJwtRefreshSecret: vi.fn(() => MIN_SECRET),
  getCorsOriginsRaw: vi.fn(() => 'https://app.example.com'),
}))

describe('validateProductionEnv', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing outside production', async () => {
    const { env } = await import('../../src/config/env.js')
    vi.mocked(env).NODE_ENV = 'development'

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    const { validateProductionEnv } = await import('../../src/config/validate-production-env.js')

    validateProductionEnv()

    expect(exitSpy).not.toHaveBeenCalled()
    vi.mocked(env).NODE_ENV = 'production'
  })

  it('exits when JWT access secret is missing in production', async () => {
    const { getJwtAccessSecret } = await import('../../src/config/production-secrets.js')
    vi.mocked(getJwtAccessSecret).mockReturnValueOnce(undefined)

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { validateProductionEnv } = await import('../../src/config/validate-production-env.js')
    validateProductionEnv()

    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it('exits when JWT_REFRESH_SECRET is missing in production', async () => {
    const { getJwtRefreshSecret } = await import('../../src/config/production-secrets.js')
    vi.mocked(getJwtRefreshSecret).mockReturnValueOnce(undefined)

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { validateProductionEnv } = await import('../../src/config/validate-production-env.js')
    validateProductionEnv()

    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it('passes with required production variables', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)

    const { validateProductionEnv } = await import('../../src/config/validate-production-env.js')
    validateProductionEnv()

    expect(exitSpy).not.toHaveBeenCalled()
  })
})
