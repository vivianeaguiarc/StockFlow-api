import { randomUUID } from 'node:crypto'

export const DEFAULT_TEST_PASSWORD = 'Test@123456'

export function uniqueSuffix(): string {
  return `${Date.now()}-${randomUUID()}`
}
