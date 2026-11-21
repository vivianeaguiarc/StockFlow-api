import { describe, expect, it } from 'vitest'

import { assertCanUpdateUser } from '../../src/modules/users/utils/assert-can-update-user.js'

const admin = { id: 'admin-1', role: 'ADMIN' as const }
const otherAdmin = { id: 'admin-2', role: 'ADMIN' as const }
const manager = { id: 'manager-1', role: 'MANAGER' as const }
const otherManager = { id: 'manager-2', role: 'MANAGER' as const }
const user = { id: 'user-1', role: 'USER' as const }

function expectForbidden(fn: () => void): void {
  expect(fn).toThrowError(expect.objectContaining({ statusCode: 403, message: 'Forbidden' }))
}

describe('assertCanUpdateUser', () => {
  describe('ADMIN', () => {
    it('can update any field of any user', () => {
      expect(() =>
        assertCanUpdateUser(admin, otherAdmin, {
          password: 'NewPass@123',
          email: 'new@example.com',
          role: 'MANAGER',
          status: 'INACTIVE',
        }),
      ).not.toThrow()
      expect(() => assertCanUpdateUser(admin, manager, { role: 'USER' })).not.toThrow()
      expect(() => assertCanUpdateUser(admin, user, { password: 'NewPass@123' })).not.toThrow()
    })
  })

  describe('MANAGER', () => {
    it('can update name and status of a USER', () => {
      expect(() =>
        assertCanUpdateUser(manager, user, {
          firstName: 'New',
          lastName: 'Name',
          status: 'INACTIVE',
        }),
      ).not.toThrow()
    })

    it('cannot change password, email or role of a USER', () => {
      expectForbidden(() => assertCanUpdateUser(manager, user, { password: 'NewPass@123' }))
      expectForbidden(() => assertCanUpdateUser(manager, user, { email: 'x@example.com' }))
      expectForbidden(() => assertCanUpdateUser(manager, user, { role: 'MANAGER' }))
    })

    it('cannot update an ADMIN in any way', () => {
      expectForbidden(() => assertCanUpdateUser(manager, admin, { firstName: 'Hacked' }))
      expectForbidden(() => assertCanUpdateUser(manager, admin, { password: 'NewPass@123' }))
      expectForbidden(() => assertCanUpdateUser(manager, admin, { email: 'me@evil.com' }))
      expectForbidden(() => assertCanUpdateUser(manager, admin, { role: 'USER' }))
      expectForbidden(() => assertCanUpdateUser(manager, admin, { status: 'INACTIVE' }))
    })

    it('cannot update another MANAGER', () => {
      expectForbidden(() => assertCanUpdateUser(manager, otherManager, { firstName: 'X' }))
    })

    it('can update only own first and last name', () => {
      expect(() =>
        assertCanUpdateUser(manager, manager, { firstName: 'Me', lastName: 'Myself' }),
      ).not.toThrow()
      expectForbidden(() => assertCanUpdateUser(manager, manager, { role: 'USER' }))
      expectForbidden(() => assertCanUpdateUser(manager, manager, { status: 'INACTIVE' }))
      expectForbidden(() => assertCanUpdateUser(manager, manager, { email: 'me@example.com' }))
      expectForbidden(() => assertCanUpdateUser(manager, manager, { password: 'NewPass@123' }))
    })
  })

  describe('USER', () => {
    it('is always denied', () => {
      expectForbidden(() => assertCanUpdateUser(user, user, { firstName: 'Me' }))
      expectForbidden(() => assertCanUpdateUser(user, manager, { firstName: 'X' }))
    })
  })
})
