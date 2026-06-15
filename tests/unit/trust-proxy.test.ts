import { afterEach, describe, expect, it, vi } from 'vitest'

describe('trust proxy', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('enables trust proxy in production', async () => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'production')

    const { createApp } = await import('../../src/app.js')
    const app = createApp()

    expect(app.get('trust proxy')).toBe(1)
  })

  it('enables trust proxy when TRUST_PROXY=true', async () => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('TRUST_PROXY', 'true')

    const { createApp } = await import('../../src/app.js')
    const app = createApp()

    expect(app.get('trust proxy')).toBe(1)
  })
})
