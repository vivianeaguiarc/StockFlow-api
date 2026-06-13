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

describe('Users E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('returns 401 when creating user without token', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        firstName: 'No',
        lastName: 'Auth',
        email: `no-auth-${uniqueSuffix()}@test.com`,
        password: 'Test@123456',
        role: 'EMPLOYEE',
      })
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('returns 403 when employee tries to create user', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'EMPLOYEE')

    const response = await request(app)
      .post('/api/users')
      .set(authHeader(employee.accessToken))
      .send({
        firstName: 'Blocked',
        lastName: 'User',
        email: `blocked-${uniqueSuffix()}@test.com`,
        password: 'Test@123456',
        role: 'EMPLOYEE',
      })
      .expect(403)

    expect(response.body.message).toBe('Forbidden')
  })

  it('returns 403 when employee tries to list users', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'EMPLOYEE')

    await request(app).get('/api/users').set(authHeader(employee.accessToken)).expect(403)
  })

  it('supports create, list, get, update and soft delete as admin', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const email = `manager-${suffix}@test.com`

    const created = await request(app)
      .post('/api/users')
      .set(authHeader(admin.accessToken))
      .send({
        firstName: 'Manager',
        lastName: 'User',
        email,
        password: 'Test@123456',
        role: 'MANAGER',
      })
      .expect(201)

    const userId = created.body.id as string

    const list = await request(app).get('/api/users').set(authHeader(admin.accessToken)).expect(200)

    expect(list.body.data.some((user: { id: string }) => user.id === userId)).toBe(true)

    const fetched = await request(app)
      .get(`/api/users/${userId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(fetched.body.email).toBe(email)

    const updated = await request(app)
      .patch(`/api/users/${userId}`)
      .set(authHeader(admin.accessToken))
      .send({ firstName: 'UpdatedManager' })
      .expect(200)

    expect(updated.body.firstName).toBe('UpdatedManager')

    await request(app).delete(`/api/users/${userId}`).set(authHeader(admin.accessToken)).expect(204)

    await request(app).get(`/api/users/${userId}`).set(authHeader(admin.accessToken)).expect(404)
  })

  it('does not allow accessing users from another company', async () => {
    const companyA = await registerCompanyAndAdmin(`users-a-${uniqueSuffix()}`)
    const companyB = await registerCompanyAndAdmin(`users-b-${uniqueSuffix()}`)
    companyIds.push(companyA.companyId, companyB.companyId)

    const managerA = await createUserWithRole(companyA.accessToken, 'MANAGER')

    await request(app)
      .get(`/api/users/${managerA.userId}`)
      .set(authHeader(companyB.accessToken))
      .expect(404)
  })
})
