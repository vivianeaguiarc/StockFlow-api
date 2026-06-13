import { z } from 'zod'

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, 'Refresh token is required'),
})

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>

export type RefreshTokenResponseDto = {
  accessToken: string
  refreshToken: string
}

export const logoutSchema = refreshTokenSchema

export type LogoutDto = RefreshTokenDto
