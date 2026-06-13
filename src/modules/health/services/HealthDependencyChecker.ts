import { createClient } from 'redis'

import { env } from '../../../config/env.js'
import { getRedisClient } from '../../../shared/cache/redis-client.js'
import { prisma } from '../../../shared/database/prisma.js'
import type { ServiceStatus } from '../dtos/health-response.dto.js'

export type DependencyStatuses = {
  database: ServiceStatus
  redis: ServiceStatus
}

export class HealthDependencyChecker {
  async checkDatabase(): Promise<ServiceStatus> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return 'up'
    } catch {
      return 'down'
    }
  }

  async checkRedis(): Promise<ServiceStatus> {
    try {
      const existingClient = await getRedisClient()

      if (existingClient?.isOpen) {
        const response = await existingClient.ping()
        return response === 'PONG' ? 'up' : 'down'
      }

      const client = createClient({ url: env.REDIS_URL })

      await client.connect()
      const response = await client.ping()
      await client.quit()

      return response === 'PONG' ? 'up' : 'down'
    } catch {
      return 'down'
    }
  }

  async checkAll(): Promise<DependencyStatuses> {
    const [database, redis] = await Promise.all([this.checkDatabase(), this.checkRedis()])

    return { database, redis }
  }
}
