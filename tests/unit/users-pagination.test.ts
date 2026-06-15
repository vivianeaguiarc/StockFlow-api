import { describe, expect, it } from 'vitest'

import { buildPaginationMeta } from '../../src/shared/utils/pagination.js'

describe('buildPaginationMeta', () => {
  it('builds pagination metadata with navigation flags', () => {
    expect(buildPaginationMeta(1, 10, 50)).toEqual({
      page: 1,
      limit: 10,
      totalItems: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPreviousPage: false,
    })
  })

  it('marks hasPreviousPage on later pages', () => {
    expect(buildPaginationMeta(3, 10, 50)).toEqual({
      page: 3,
      limit: 10,
      totalItems: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPreviousPage: true,
    })
  })

  it('marks hasNextPage false on last page', () => {
    expect(buildPaginationMeta(5, 10, 50)).toEqual({
      page: 5,
      limit: 10,
      totalItems: 50,
      totalPages: 5,
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })

  it('handles empty result sets', () => {
    expect(buildPaginationMeta(1, 10, 0)).toEqual({
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    })
  })
})
