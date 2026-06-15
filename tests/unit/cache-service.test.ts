import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CacheService } from '../../src/shared/cache/CacheService.js'
import * as redisClient from '../../src/shared/cache/redis-client.js'
import * as logger from '../../src/shared/logger/logger.js'

function createMockRedisClient() {
  const store = new Map<string, string>()

  return {
    isOpen: true,
    get: vi.fn(async (key: string) => (store.has(key) ? store.get(key)! : null)),
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value)
      return 'OK'
    }),
    del: vi.fn(async (keys: string | string[]) => {
      const keyList = Array.isArray(keys) ? keys : [keys]
      keyList.forEach((key) => store.delete(key))
      return keyList.length
    }),
    scanIterator: vi.fn(({ MATCH }: { MATCH: string }) => {
      const regex = new RegExp(`^${MATCH.replace(/\*/g, '.*')}$`)

      return (async function* () {
        for (const key of store.keys()) {
          if (regex.test(key)) {
            yield key
          }
        }
      })()
    }),
    _store: store,
  }
}

describe('CacheService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns cached value on cache hit without calling fetcher', async () => {
    const client = createMockRedisClient()
    await client.set('key-1', JSON.stringify({ value: 'cached' }))

    vi.spyOn(redisClient, 'getRedisClient').mockResolvedValue(client as never)
    const logDebug = vi.spyOn(logger, 'logDebug').mockImplementation(() => undefined)

    const fetcher = vi.fn()
    const service = new CacheService(300)
    const result = await service.getOrSet('key-1', fetcher)

    expect(result).toEqual({ value: 'cached' })
    expect(fetcher).not.toHaveBeenCalled()
    expect(logDebug).toHaveBeenCalledWith({ key: 'key-1' }, 'Cache hit')
  })

  it('calls fetcher and stores value on cache miss', async () => {
    const client = createMockRedisClient()

    vi.spyOn(redisClient, 'getRedisClient').mockResolvedValue(client as never)
    const logDebug = vi.spyOn(logger, 'logDebug').mockImplementation(() => undefined)

    const fetcher = vi.fn().mockResolvedValue({ value: 'fresh' })
    const service = new CacheService(300)
    const result = await service.getOrSet('key-2', fetcher, 60)

    expect(result).toEqual({ value: 'fresh' })
    expect(fetcher).toHaveBeenCalledOnce()
    expect(client.set).toHaveBeenCalledWith('key-2', JSON.stringify({ value: 'fresh' }), {
      EX: 60,
    })
    expect(logDebug).toHaveBeenCalledWith({ key: 'key-2' }, 'Cache miss')
  })

  it('falls back to fetcher when Redis is unavailable', async () => {
    vi.spyOn(redisClient, 'getRedisClient').mockResolvedValue(null)

    const fetcher = vi.fn().mockResolvedValue({ value: 'from-db' })
    const service = new CacheService(300)
    const result = await service.getOrSet('key-3', fetcher)

    expect(result).toEqual({ value: 'from-db' })
    expect(fetcher).toHaveBeenCalledOnce()
  })

  it('logs cache invalidation when deleting keys', async () => {
    const client = createMockRedisClient()
    await client.set('key-del', JSON.stringify({ value: 1 }))

    vi.spyOn(redisClient, 'getRedisClient').mockResolvedValue(client as never)
    const logInfo = vi.spyOn(logger, 'logInfo').mockImplementation(() => undefined)

    const service = new CacheService(300)
    await service.del('key-del')

    expect(client.del).toHaveBeenCalledWith('key-del')
    expect(logInfo).toHaveBeenCalledWith({ key: 'key-del' }, 'Cache invalidation')
  })

  it('invalidates keys by pattern', async () => {
    const client = createMockRedisClient()
    await client.set('stockflow:c1:users:list:abc', JSON.stringify({ data: [] }))
    await client.set('stockflow:c1:users:list:def', JSON.stringify({ data: [] }))
    await client.set('stockflow:c1:users:id:u1', JSON.stringify({ id: 'u1' }))

    vi.spyOn(redisClient, 'getRedisClient').mockResolvedValue(client as never)
    const logInfo = vi.spyOn(logger, 'logInfo').mockImplementation(() => undefined)

    const service = new CacheService(300)
    await service.delByPattern('stockflow:c1:users:list:*')

    expect(client._store.has('stockflow:c1:users:list:abc')).toBe(false)
    expect(client._store.has('stockflow:c1:users:list:def')).toBe(false)
    expect(client._store.has('stockflow:c1:users:id:u1')).toBe(true)
    expect(logInfo).toHaveBeenCalledWith(
      expect.objectContaining({ pattern: 'stockflow:c1:users:list:*', keysRemoved: 2 }),
      'Cache invalidation',
    )
  })
})
