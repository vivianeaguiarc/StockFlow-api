import { describe, expect, it, vi } from 'vitest'

import { resolveRequestId } from '../../src/shared/observability/resolve-request-id.js'

const INCOMING_ID = '550e8400-e29b-41d4-a716-446655440000'
const GENERATED_ID = '11111111-1111-4111-8111-111111111111'

function createGenerator() {
  return { generate: vi.fn(() => GENERATED_ID) }
}

describe('resolveRequestId', () => {
  it('preserves a valid incoming x-request-id', () => {
    const generator = createGenerator()

    expect(resolveRequestId(INCOMING_ID, generator)).toBe(INCOMING_ID)
    expect(generator.generate).not.toHaveBeenCalled()
  })

  it('generates a new id when header is missing or invalid', () => {
    const generator = createGenerator()

    expect(resolveRequestId(undefined, generator)).toBe(GENERATED_ID)
    expect(resolveRequestId('not-a-uuid', generator)).toBe(GENERATED_ID)
    expect(resolveRequestId('', generator)).toBe(GENERATED_ID)
    expect(generator.generate).toHaveBeenCalledTimes(3)
  })
})
