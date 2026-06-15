import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'

import {
  app,
  authHeader,
  createUserWithRole,
  registerCompanyAndAdmin,
} from '../helpers/auth-helper.js'
import { cleanupCompanies } from '../helpers/cleanup.js'
import { uniqueSuffix } from '../helpers/test-data.js'

describe('Companies E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('returns 401 when accessing /api/companies/me without token', async () => {
    const response = await request(app).get('/api/v1/companies/me').expect(401)

    expect(response.body).toMatchObject({
      success: false,
      message: 'Unauthorized',
    })
  })

  it('returns company profile for authenticated admin', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const response = await request(app)
      .get('/api/v1/companies/me')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data).toMatchObject({
      id: admin.companyId,
      name: admin.companyName,
    })
  })

  it('returns 403 when employee tries to update company profile', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')

    const response = await request(app)
      .patch('/api/v1/companies/me')
      .set(authHeader(employee.accessToken))
      .send({ name: 'Updated Name' })
      .expect(403)

    expect(response.body.message).toBe('Forbidden')
  })

  it('updates company profile as admin', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const updatedName = `Updated Company ${uniqueSuffix()}`

    const response = await request(app)
      .patch('/api/v1/companies/me')
      .set(authHeader(admin.accessToken))
      .send({ name: updatedName })
      .expect(200)

    expect(response.body.data.name).toBe(updatedName)
  })

  it('does not expose one company profile to another tenant', async () => {
    const companyA = await registerCompanyAndAdmin(`tenant-a-${uniqueSuffix()}`)
    const companyB = await registerCompanyAndAdmin(`tenant-b-${uniqueSuffix()}`)
    companyIds.push(companyA.companyId, companyB.companyId)

    const profileB = await request(app)
      .get('/api/v1/companies/me')
      .set(authHeader(companyB.accessToken))
      .expect(200)

    expect(profileB.body.data.id).toBe(companyB.companyId)
    expect(profileB.body.data.id).not.toBe(companyA.companyId)
    expect(profileB.body.data.name).toBe(companyB.companyName)
  })

  it('creates company as admin', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()

    const response = await request(app)
      .post('/api/v1/companies')
      .set(authHeader(admin.accessToken))
      .send({
        name: `Created Company ${suffix}`,
        document: `created-doc-${suffix}`,
        email: `created-${suffix}@test.com`,
      })
      .expect(201)

    expect(response.body.data).toMatchObject({
      name: `Created Company ${suffix}`,
      document: `created-doc-${suffix}`,
      email: `created-${suffix}@test.com`,
      active: true,
    })
  })

  it('lists own company with pagination', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const response = await request(app)
      .get('/api/v1/companies?page=1&limit=10')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].id).toBe(admin.companyId)
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      totalItems: 1,
    })
  })

  it('returns company by id for manager of same tenant', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const manager = await createUserWithRole(admin.accessToken, 'MANAGER')

    const response = await request(app)
      .get(`/api/v1/companies/${admin.companyId}`)
      .set(authHeader(manager.accessToken))
      .expect(200)

    expect(response.body.data.id).toBe(admin.companyId)
  })

  it('returns 404 when trying to access another company by id', async () => {
    const companyA = await registerCompanyAndAdmin(`crud-a-${uniqueSuffix()}`)
    const companyB = await registerCompanyAndAdmin(`crud-b-${uniqueSuffix()}`)
    companyIds.push(companyA.companyId, companyB.companyId)

    await request(app)
      .get(`/api/v1/companies/${companyA.companyId}`)
      .set(authHeader(companyB.accessToken))
      .expect(404)
  })

  it('updates company as admin', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const updatedName = `CRUD Updated ${uniqueSuffix()}`

    const response = await request(app)
      .patch(`/api/v1/companies/${admin.companyId}`)
      .set(authHeader(admin.accessToken))
      .send({ name: updatedName })
      .expect(200)

    expect(response.body.data.name).toBe(updatedName)
  })

  it('returns 403 when user tries to manage companies', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')

    await request(app)
      .post('/api/v1/companies')
      .set(authHeader(employee.accessToken))
      .send({
        name: 'Blocked',
        email: `blocked-${uniqueSuffix()}@test.com`,
      })
      .expect(403)

    await request(app).get('/api/v1/companies').set(authHeader(employee.accessToken)).expect(403)
  })

  it('includes email in jwt payload after login', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: admin.password })
      .expect(200)

    const token = loginResponse.body.data.accessToken as string
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())

    expect(payload).toMatchObject({
      userId: admin.userId,
      email: admin.email,
      role: 'ADMIN',
      companyId: admin.companyId,
    })
  })
})
