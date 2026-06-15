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
      status: 'error',
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

    expect(response.body).toMatchObject({
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

    expect(response.body.name).toBe(updatedName)
  })

  it('does not expose one company profile to another tenant', async () => {
    const companyA = await registerCompanyAndAdmin(`tenant-a-${uniqueSuffix()}`)
    const companyB = await registerCompanyAndAdmin(`tenant-b-${uniqueSuffix()}`)
    companyIds.push(companyA.companyId, companyB.companyId)

    const profileB = await request(app)
      .get('/api/v1/companies/me')
      .set(authHeader(companyB.accessToken))
      .expect(200)

    expect(profileB.body.id).toBe(companyB.companyId)
    expect(profileB.body.id).not.toBe(companyA.companyId)
    expect(profileB.body.name).toBe(companyB.companyName)
  })
})
