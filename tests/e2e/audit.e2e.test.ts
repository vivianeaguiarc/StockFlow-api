import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'

import { app, authHeader, registerCompanyAndAdmin } from '../helpers/auth-helper.js'
import { cleanupCompanies } from '../helpers/cleanup.js'
import { uniqueSuffix } from '../helpers/test-data.js'

describe('Audit Logs E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('returns 403 when manager tries to list audit logs', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const managerEmail = `manager-${uniqueSuffix()}@test.com`

    await request(app)
      .post('/api/users')
      .set(authHeader(admin.accessToken))
      .send({
        firstName: 'Manager',
        lastName: 'User',
        email: managerEmail,
        password: 'Test@123456',
        role: 'MANAGER',
      })
      .expect(201)

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: managerEmail, password: 'Test@123456' })
      .expect(200)

    await request(app)
      .get('/api/audit/logs')
      .set(authHeader(login.body.accessToken as string))
      .expect(403)
  })

  it('supports pagination, sorting and filters on list', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()

    await request(app)
      .post('/api/categories')
      .set(authHeader(admin.accessToken))
      .send({ name: `Audit Category ${suffix}` })
      .expect(201)

    const list = await request(app)
      .get('/api/audit/logs?page=1&pageSize=5&sortBy=createdAt&sortOrder=desc')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(list.body.meta).toMatchObject({
      page: 1,
      pageSize: 5,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number),
    })
    expect(list.body.data.length).toBeGreaterThan(0)

    const createLogs = await request(app)
      .get('/api/audit/logs?action=CREATE')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(createLogs.body.data.every((log: { action: string }) => log.action === 'CREATE')).toBe(
      true,
    )

    const entityLogs = await request(app)
      .get('/api/audit/logs?entity=Category')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(
      entityLogs.body.data.every((log: { entity: string }) =>
        log.entity.toLowerCase().includes('category'),
      ),
    ).toBe(true)

    const userLogs = await request(app)
      .get(`/api/audit/logs?userId=${admin.userId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(userLogs.body.data.every((log: { userId: string }) => log.userId === admin.userId)).toBe(
      true,
    )
  })
})
