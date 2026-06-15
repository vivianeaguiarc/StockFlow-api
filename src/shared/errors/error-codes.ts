export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

export function resolveErrorCode(statusCode: number): ErrorCode {
  switch (statusCode) {
    case 400:
      return ERROR_CODES.VALIDATION_ERROR
    case 401:
      return ERROR_CODES.UNAUTHORIZED
    case 403:
      return ERROR_CODES.FORBIDDEN
    case 404:
      return ERROR_CODES.NOT_FOUND
    case 409:
      return ERROR_CODES.CONFLICT
    case 413:
      return ERROR_CODES.PAYLOAD_TOO_LARGE
    case 429:
      return ERROR_CODES.TOO_MANY_REQUESTS
    case 503:
      return ERROR_CODES.SERVICE_UNAVAILABLE
    default:
      return ERROR_CODES.INTERNAL_SERVER_ERROR
  }
}
