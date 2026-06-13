import { createClient, type RedisClientType } from 'redis'

import { env } from '../../config/env.js'
import { logInfo, logWarn } from '../logger/logger.js'

export type RedisClient = RedisClientType

let client: RedisClient | null = null
let connectionAttempted = false

export function isCacheEnabled(): boolean {
  if (env.CACHE_ENABLED !== undefined) {
    return env.CACHE_ENABLED
  }

  return env.NODE_ENV !== 'test'
}

export async function getRedisClient(): Promise<RedisClient | null> {
  if (!isCacheEnabled()) {
    return null
  }

  if (client?.isOpen) {
    return client
  }

  if (connectionAttempted && !client?.isOpen) {
    return null
  }

  connectionAttempted = true

  try {
    client = createClient({ url: env.REDIS_URL })

    client.on('error', (error) => {
      logWarn({ err: error }, 'Redis client error')
    })

    await client.connect()
    logInfo({ url: env.REDIS_URL }, 'Redis connected')

    return client
  } catch (error) {
    logWarn({ err: error }, 'Redis connection failed')
    client = null
    return null
  }
}

export async function disconnectRedis(): Promise<void> {
  if (client?.isOpen) {
    await client.quit()
  }

  client = null
  connectionAttempted = false
}
