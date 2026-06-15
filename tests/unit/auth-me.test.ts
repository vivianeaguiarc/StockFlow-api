import { describe, expect, it, vi } from 'vitest'

import type { AuthMeResponseDto } from '../../src/modules/auth/dtos/auth-me-response.dto.js'
import { AuthService } from '../../src/modules/auth/services/AuthService.js'
import { RefreshTokenService } from '../../src/modules/auth/services/RefreshTokenService.js'
import { cacheService } from '../../src/shared/cache/CacheService.js'
import { AppError } from '../../src/shared/errors/AppError.js'
import { createRefreshTokensRepositoryMock } from '../helpers/mocks/refresh-tokens-repository.mock.js'
import { createUsersRepositoryMock } from '../helpers/mocks/users-repository.mock.js'

vi.mock('../../src/shared/cache/CacheService.js', () => ({
  cacheService: {
    getOrSet: vi.fn((_key: string, fetcher: () => Promise<unknown>) => fetcher()),
  },
}))

describe('AuthService.getMe', () => {
  const usersRepository = createUsersRepositoryMock()
  const refreshTokenService = new RefreshTokenService(createRefreshTokensRepositoryMock())

  function createService() {
    return new AuthService(usersRepository, refreshTokenService)
  }

  it('returns safe user profile fields', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z')
    const updatedAt = new Date('2026-01-02T00:00:00.000Z')

    vi.mocked(usersRepository.findProfileById).mockResolvedValue({
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'ADMIN',
      createdAt,
      updatedAt,
    })

    const profile = await createService().getMe('user-1')

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
  })

  it('throws 404 when user is not found', async () => {
    vi.mocked(usersRepository.findProfileById).mockResolvedValue(null)

    await expect(createService().getMe('missing-user')).rejects.toMatchObject({
      message: 'User not found',
      statusCode: 404,
    } satisfies Partial<AppError>)
  })
})
