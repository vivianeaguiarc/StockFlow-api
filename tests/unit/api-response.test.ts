import { describe, expect, it } from 'vitest'

import {
  buildErrorResponseBody,
  paginatedResponse,
  successResponse,
} from '../../src/shared/http/api-response.js'
import { ERROR_CODES } from '../../src/shared/errors/error-codes.js'

function createMockResponse() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
  }

  return response
}

describe('api response helpers', () => {
  it('builds success responses', () => {
    const res = createMockResponse()

    successResponse(res as never, { id: '1' }, 'User retrieved successfully')

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      success: true,
      message: 'User retrieved successfully',
      data: { id: '1' },
    })
  })

  it('builds paginated responses', () => {
    const res = createMockResponse()

    paginatedResponse(
      res as never,
      {
        data: [{ id: '1' }],
        pagination: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      'Users retrieved successfully',
    )

    expect(res.body).toEqual({
      success: true,
      message: 'Users retrieved successfully',
      data: [{ id: '1' }],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })
  })

  it('builds standardized error bodies', () => {
    const body = buildErrorResponseBody({ requestId: 'req-1' } as never, 'Validation error', {
      statusCode: 400,
      details: [{ field: 'email' }],
    })

    expect(body).toEqual({
      success: false,
      message: 'Validation error',
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        details: [{ field: 'email' }],
      },
      requestId: 'req-1',
    })
  })
})
