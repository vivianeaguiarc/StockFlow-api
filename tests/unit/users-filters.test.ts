import { describe, expect, it } from 'vitest'

import { buildUsersListWhere } from '../../src/modules/users/utils/build-users-list-where.js'

describe('buildUsersListWhere', () => {
  it('always scopes to company and non-deleted users', () => {
    expect(buildUsersListWhere('company-1', {})).toEqual({
      companyId: 'company-1',
      deletedAt: null,
    })
  })

  it('applies case-insensitive name filter on first or last name', () => {
    expect(buildUsersListWhere('company-1', { name: 'vivi' })).toEqual({
      companyId: 'company-1',
      deletedAt: null,
      OR: [
        { firstName: { contains: 'vivi', mode: 'insensitive' } },
        { lastName: { contains: 'vivi', mode: 'insensitive' } },
      ],
    })
  })

  it('applies case-insensitive email filter', () => {
    expect(buildUsersListWhere('company-1', { email: 'gmail' })).toEqual({
      companyId: 'company-1',
      deletedAt: null,
      email: {
        contains: 'gmail',
        mode: 'insensitive',
      },
    })
  })

  it('applies exact role filter', () => {
    expect(buildUsersListWhere('company-1', { role: 'ADMIN' })).toEqual({
      companyId: 'company-1',
      deletedAt: null,
      role: 'ADMIN',
    })
  })

  it('combines multiple filters', () => {
    expect(
      buildUsersListWhere('company-1', {
        name: 'ana',
        email: 'gmail',
        role: 'MANAGER',
      }),
    ).toEqual({
      companyId: 'company-1',
      deletedAt: null,
      role: 'MANAGER',
      OR: [
        { firstName: { contains: 'ana', mode: 'insensitive' } },
        { lastName: { contains: 'ana', mode: 'insensitive' } },
      ],
      email: {
        contains: 'gmail',
        mode: 'insensitive',
      },
    })
  })
})
