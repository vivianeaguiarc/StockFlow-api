import { env } from '../../config/env.js'
import { logDebug, logInfo, logWarn } from '../logger/logger.js'
import { getRedisClient } from './redis-client.js'

export class CacheService {
  constructor(private readonly defaultTtlSeconds = env.CACHE_TTL_SECONDS) {}

  async get<T>(key: string): Promise<T | null> {
    const client = await getRedisClient()

    if (!client) {
      return null
    }

    try {
      const value = await client.get(key)

      if (value === null) {
        return null
      }

      return JSON.parse(value) as T
    } catch (error) {
      logWarn({ err: error, key }, 'Cache get failed')
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = this.defaultTtlSeconds): Promise<void> {
    const client = await getRedisClient()

    if (!client) {
      return
    }

    try {
      await client.set(key, JSON.stringify(value), { EX: ttlSeconds })
    } catch (error) {
      logWarn({ err: error, key }, 'Cache set failed')
    }
  }

  async del(key: string): Promise<void> {
    const client = await getRedisClient()

    if (!client) {
      return
    }

    try {
      await client.del(key)
      logInfo({ key }, 'Cache invalidation')
    } catch (error) {
      logWarn({ err: error, key }, 'Cache del failed')
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    const client = await getRedisClient()

    if (!client) {
      return
    }

    try {
      const keys: string[] = []

      for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        keys.push(String(key))
      }

      if (keys.length > 0) {
        await client.del(keys)
        logInfo({ pattern, keysRemoved: keys.length }, 'Cache invalidation')
      }
    } catch (error) {
      logWarn({ err: error, pattern }, 'Cache delByPattern failed')
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = this.defaultTtlSeconds,
  ): Promise<T> {
    const cached = await this.get<T>(key)

    if (cached !== null) {
      logDebug({ key }, 'Cache hit')
      return cached
    }

    logDebug({ key }, 'Cache miss')

    const value = await fetcher()
    await this.set(key, value, ttlSeconds)

    return value
  }
}

export const cacheService = new CacheService()
