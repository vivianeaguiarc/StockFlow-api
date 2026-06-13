export const REQUEST_ID_HEADER = 'X-Request-ID'
export const CORRELATION_ID_HEADER = 'X-Correlation-ID'

export const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidUuid(value: string): boolean {
  return UUID_V4_REGEX.test(value)
}
