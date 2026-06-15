import { describe, expect, it } from 'vitest'

import { buildApiServerUrl, RENDER_PRODUCTION_HOST } from '../../src/docs/swagger.js'

describe('Swagger servers', () => {
  it('builds production server URL with /api/v1 prefix', () => {
    expect(buildApiServerUrl(RENDER_PRODUCTION_HOST)).toBe(
      'https://stockflow-api-l4x4.onrender.com/api/v1',
    )
  })

  it('keeps URL unchanged when API prefix is already present', () => {
    expect(buildApiServerUrl('https://stockflow-api-l4x4.onrender.com/api/v1')).toBe(
      'https://stockflow-api-l4x4.onrender.com/api/v1',
    )
  })

  it('builds local server URL with /api/v1 prefix', () => {
    expect(buildApiServerUrl('http://localhost:3333')).toBe('http://localhost:3333/api/v1')
  })
})
