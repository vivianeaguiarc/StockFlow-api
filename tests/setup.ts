import 'dotenv/config'

import { afterAll } from 'vitest'

import { prisma } from '../src/shared/database/prisma.js'

afterAll(async () => {
  await prisma.$disconnect()
})
