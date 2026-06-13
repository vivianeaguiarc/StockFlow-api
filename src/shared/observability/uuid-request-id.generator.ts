import { randomUUID } from 'node:crypto'

import type { RequestIdGenerator } from './request-id.generator.js'

export class UuidRequestIdGenerator implements RequestIdGenerator {
  generate(): string {
    return randomUUID()
  }
}
