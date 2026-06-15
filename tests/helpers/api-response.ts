export function getResponseData<T>(body: { success: boolean; data: T }): T {
  return body.data
}

export function getAuthTokens(body: {
  success: boolean
  data: { accessToken: string; refreshToken: string }
}): { accessToken: string; refreshToken: string } {
  return {
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken,
  }
}
