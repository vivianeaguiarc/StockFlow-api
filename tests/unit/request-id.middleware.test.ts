import type { Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'

import {
  CORRELATION_ID_HEADER,
  isValidUuid,
  REQUEST_ID_HEADER,
} from '../../src/shared/observability/constants.js'
import { correlationIdMiddleware } from '../../src/shared/observability/correlation-id.middleware.js'
import { resolveCorrelationId } from '../../src/shared/observability/correlation-id.resolver.js'
import { createRequestIdMiddleware } from '../../src/shared/observability/request-id.middleware.js'

const FIXED_REQUEST_ID = '11111111-1111-4111-8111-111111111111'
const FIXED_CORRELATION_ID = '22222222-2222-4222-8222-222222222222'

function createMockResponse() {
  const headers = new Map<string, string>()

  return {
    setHeader: vi.fn((name: string, value: string) => {
      headers.set(name, value)
    }),
    getHeader: (name: string) => headers.get(name),
  } as unknown as Response
}

function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    requestId: FIXED_REQUEST_ID,
    ...overrides,
  } as Request
}

describe('isValidUuid', () => {
  it('accepts valid UUID v4', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('rejects invalid values', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false)
    expect(isValidUuid('')).toBe(false)
  })
})

describe('resolveCorrelationId', () => {
  it('uses incoming correlation id when valid', () => {
    expect(resolveCorrelationId(FIXED_CORRELATION_ID, FIXED_REQUEST_ID)).toBe(FIXED_CORRELATION_ID)
  })

  it('falls back to request id when header is missing or invalid', () => {
    expect(resolveCorrelationId(undefined, FIXED_REQUEST_ID)).toBe(FIXED_REQUEST_ID)
    expect(resolveCorrelationId('invalid', FIXED_REQUEST_ID)).toBe(FIXED_REQUEST_ID)
  })
})

describe('createRequestIdMiddleware', () => {
  it('assigns request id, exposes it on req and sets response header', () => {
    const generator = { generate: vi.fn(() => FIXED_REQUEST_ID) }
    const middleware = createRequestIdMiddleware(generator)
    const req = createMockRequest()
    const res = createMockResponse()
    const next = vi.fn()

    middleware(req, res, next)

    expect(generator.generate).toHaveBeenCalledOnce()
    expect(req.requestId).toBe(FIXED_REQUEST_ID)
    expect(res.getHeader(REQUEST_ID_HEADER)).toBe(FIXED_REQUEST_ID)
    expect(next).toHaveBeenCalledOnce()
  })

  it('preserves a valid incoming x-request-id header', () => {
    const incomingId = '550e8400-e29b-41d4-a716-446655440000'
    const generator = { generate: vi.fn(() => FIXED_REQUEST_ID) }
    const middleware = createRequestIdMiddleware(generator)
    const req = createMockRequest({
      headers: { [REQUEST_ID_HEADER.toLowerCase()]: incomingId },
    })
    const res = createMockResponse()
    const next = vi.fn()

    middleware(req, res, next)

    expect(generator.generate).not.toHaveBeenCalled()
    expect(req.requestId).toBe(incomingId)
    expect(res.getHeader(REQUEST_ID_HEADER)).toBe(incomingId)
    expect(next).toHaveBeenCalledOnce()
  })
})

describe('correlationIdMiddleware', () => {
  it('reuses valid incoming correlation id', () => {
    const req = createMockRequest({
      headers: {
        [CORRELATION_ID_HEADER.toLowerCase()]: FIXED_CORRELATION_ID,
      },
    })
    const res = createMockResponse()
    const next = vi.fn()

    correlationIdMiddleware(req, res, next)

    expect(req.correlationId).toBe(FIXED_CORRELATION_ID)
    expect(res.getHeader(CORRELATION_ID_HEADER)).toBe(FIXED_CORRELATION_ID)
    expect(next).toHaveBeenCalledOnce()
  })

  it('falls back to request id when correlation header is absent', () => {
    const req = createMockRequest()
    const res = createMockResponse()
    const next = vi.fn()

    correlationIdMiddleware(req, res, next)

    expect(req.correlationId).toBe(FIXED_REQUEST_ID)
    expect(res.getHeader(CORRELATION_ID_HEADER)).toBe(FIXED_REQUEST_ID)
    expect(next).toHaveBeenCalledOnce()
  })
})
