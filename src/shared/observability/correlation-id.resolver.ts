import { isValidUuid } from './constants.js'

export function resolveCorrelationId(
  incomingCorrelationId: string | undefined,
  requestId: string,
): string {
  if (incomingCorrelationId && isValidUuid(incomingCorrelationId)) {
    return incomingCorrelationId
  }

  return requestId
}

export function readHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}
