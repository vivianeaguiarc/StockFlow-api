import { createHash } from 'node:crypto'

import request from 'supertest'
import { afterEach, describe, it } from 'vitest'

import { createApp } from '../../src/app.js'
import { prisma } from '../../src/shared/database/prisma.js'
import { cleanupCompanies } from '../helpers/cleanup.js'

const app = createApp()

function createUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

describe('Refresh token expiration E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('returns 401 for expired refresh token', async () => {
    const uniqueId = createUniqueId()
    const email = `expired-${uniqueId}@test.com`
    const password = 'Test@123456'

    const register = await request(app)
      .post('/api/v1/auth/register')
      .send({
        company: {
          name: `Expired Company ${uniqueId}`,
          document: `expired-doc-${uniqueId}`,
          email: `expired-company-${uniqueId}@test.com`,
        },
        admin: {
          firstName: 'Expired',
          lastName: 'User',
          email,
          password,
        },
      })
      .expect(201)

    companyIds.push(register.body.company.id as string)

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200)

    const refreshToken = login.body.refreshToken as string

    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashRefreshToken(refreshToken) },
      data: { expiresAt: new Date('2020-01-01T00:00:00.000Z') },
    })

    await request(app).post('/api/v1/auth/refresh').send({ refreshToken }).expect(401)
  })
})
