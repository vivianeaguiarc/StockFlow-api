import { describe, expect, it, vi } from 'vitest'

import type { AuthMeResponseDto } from '../../src/modules/auth/dtos/auth-me-response.dto.js'
import { AuthService } from '../../src/modules/auth/services/AuthService.js'
import { cacheService } from '../../src/shared/cache/CacheService.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { prisma } from '../../src/shared/database/prisma.js'

vi.mock('../../src/shared/cache/CacheService.js', () => ({
  cacheService: {
    getOrSet: vi.fn((_key: string, fetcher: () => Promise<unknown>) => fetcher()),
  },
}))

describe('AuthService.getMe', () => {
  it('returns safe user profile fields', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z')
    const updatedAt = new Date('2026-01-02T00:00:00.000Z')

    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue({
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'ADMIN',
      createdAt,
      updatedAt,
    } as never)

    const service = new AuthService()
    const profile = await service.getMe('user-1')

    expect(profile).toEqual({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'ADMIN',
      createdAt,
      updatedAt,
    } satisfies AuthMeResponseDto)

    expect(cacheService.getOrSet).toHaveBeenCalledWith(
      'stockflow:auth:me:user-1',
      expect.any(Function),
      300,
    )

    vi.restoreAllMocks()
  })

  it('throws 404 when user is not found', async () => {
    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(null)

    const service = new AuthService()

    await expect(service.getMe('missing-user')).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    } satisfies Partial<AppError>)

    vi.restoreAllMocks()
  })
})
