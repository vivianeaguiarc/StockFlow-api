import { isValidUuid } from './constants.js'
import type { RequestIdGenerator } from './request-id.generator.js'

const MAX_INCOMING_REQUEST_ID_LENGTH = 128

export function resolveRequestId(
  incomingRequestId: string | undefined,
  generator: RequestIdGenerator,
): string {
  if (typeof incomingRequestId !== 'string') {
    return generator.generate()
  }

  const trimmed = incomingRequestId.trim()

  if (trimmed.length === 0 || trimmed.length > MAX_INCOMING_REQUEST_ID_LENGTH) {
    return generator.generate()
  }

  if (isValidUuid(trimmed)) {
    return trimmed
  }

  return generator.generate()
}
