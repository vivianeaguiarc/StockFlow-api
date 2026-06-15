import { describe, expect, it } from 'vitest'

import { buildLimitPaginationMeta } from '../../src/shared/utils/pagination.js'

describe('buildLimitPaginationMeta', () => {
  it('builds pagination metadata with navigation flags', () => {
    expect(buildLimitPaginationMeta(1, 10, 50)).toEqual({
      page: 1,
      limit: 10,
      totalItems: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPreviousPage: false,
    })
  })

  it('marks hasPreviousPage on later pages', () => {
    expect(buildLimitPaginationMeta(3, 10, 50)).toEqual({
      page: 3,
      limit: 10,
      totalItems: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPreviousPage: true,
    })
  })

  it('marks hasNextPage false on last page', () => {
    expect(buildLimitPaginationMeta(5, 10, 50)).toEqual({
      page: 5,
      limit: 10,
      totalItems: 50,
      totalPages: 5,
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })

  it('handles empty result sets', () => {
    expect(buildLimitPaginationMeta(1, 10, 0)).toEqual({
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    })
  })
})
