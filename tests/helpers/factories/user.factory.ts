import type { User, UserRole, UserStatus } from '@prisma/client'

type UserWithCompany = User & {
  company: {
    deletedAt: Date | null
    active: boolean
  }
}

const defaultDates = {
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
}

export function buildUser(overrides: Partial<UserWithCompany> = {}): UserWithCompany {
  return {
    id: 'user-1',
    companyId: 'company-1',
    firstName: 'Test',
    lastName: 'User',
    email: 'user@example.com',
    passwordHash: 'hashed-password',
    role: 'USER' as UserRole,
    status: 'ACTIVE' as UserStatus,
    deletedAt: null,
    ...defaultDates,
    company: {
      deletedAt: null,
      active: true,
    },
    ...overrides,
  }
}

export function buildUserResponse(overrides: Partial<ReturnType<typeof buildUserResponse>> = {}) {
  return {
    id: 'user-1',
    companyId: 'company-1',
    firstName: 'Test',
    lastName: 'User',
    email: 'user@example.com',
    role: 'USER' as UserRole,
    status: 'ACTIVE' as UserStatus,
    createdAt: defaultDates.createdAt,
    updatedAt: defaultDates.updatedAt,
    ...overrides,
  }
}
