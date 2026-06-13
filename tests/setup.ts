import 'dotenv/config'

import { afterAll } from 'vitest'

import { disconnectRedis } from '../src/shared/cache/redis-client.js'
import { prisma } from '../src/shared/database/prisma.js'

afterAll(async () => {
  await disconnectRedis()
  await prisma.$disconnect()
})
