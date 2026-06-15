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
      .post('/api/v1/users')
      .send({
        firstName: 'No',
        lastName: 'Auth',
        email: `no-auth-${uniqueSuffix()}@test.com`,
        password: 'Test@123456',
        role: 'USER',
      })
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('returns 403 when employee tries to create user', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')

    const response = await request(app)
      .post('/api/v1/users')
      .set(authHeader(employee.accessToken))
      .send({
        firstName: 'Blocked',
        lastName: 'User',
        email: `blocked-${uniqueSuffix()}@test.com`,
        password: 'Test@123456',
        role: 'USER',
      })
      .expect(403)

    expect(response.body.message).toBe('Forbidden')
  })

  it('returns 403 when manager tries to list users', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const manager = await createUserWithRole(admin.accessToken, 'MANAGER')

    await request(app).get('/api/v1/users').set(authHeader(manager.accessToken)).expect(403)
  })

  it('allows manager to update user but not delete', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const target = await createUserWithRole(admin.accessToken, 'USER')
    const manager = await createUserWithRole(admin.accessToken, 'MANAGER')

    const updated = await request(app)
      .patch(`/api/v1/users/${target.userId}`)
      .set(authHeader(manager.accessToken))
      .send({ firstName: 'ManagerUpdated' })
      .expect(200)

    expect(updated.body.firstName).toBe('ManagerUpdated')

    await request(app)
      .delete(`/api/v1/users/${target.userId}`)
      .set(authHeader(manager.accessToken))
      .expect(403)
  })

  it('returns 403 when user tries to list users', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const user = await createUserWithRole(admin.accessToken, 'USER')

    await request(app).get('/api/v1/users').set(authHeader(user.accessToken)).expect(403)
  })

  it('supports create, list, get, update and soft delete as admin', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const email = `manager-${suffix}@test.com`

    const created = await request(app)
      .post('/api/v1/users')
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

    const list = await request(app)
      .get('/api/v1/users')
      .set(authHeader(admin.accessToken))
      .expect(200)

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

  it('supports pagination, sorting and filters on list', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()

    await request(app)
      .post('/api/v1/users')
      .set(authHeader(admin.accessToken))
      .send({
        firstName: 'Vivi',
        lastName: 'Searchable',
        email: `vivi-${suffix}@test.com`,
        password: 'Test@123456',
        role: 'MANAGER',
      })
      .expect(201)

    const employee = await createUserWithRole(admin.accessToken, 'USER')

    const managers = await request(app)
      .get('/api/v1/users?role=MANAGER')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(managers.body.meta).toMatchObject({
      page: 1,
      pageSize: 10,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number),
    })
    expect(managers.body.data.every((user: { role: string }) => user.role === 'MANAGER')).toBe(true)

    const search = await request(app)
      .get('/api/v1/users?search=vivi')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(
      search.body.data.some((user: { firstName: string }) =>
        user.firstName.toLowerCase().includes('vivi'),
      ),
    ).toBe(true)

    const page1 = await request(app)
      .get('/api/v1/users?page=1&pageSize=1&sortBy=createdAt&sortOrder=asc')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(page1.body.data).toHaveLength(1)
    expect(page1.body.meta.pageSize).toBe(1)

    await request(app)
      .delete(`/api/users/${employee.userId}`)
      .set(authHeader(admin.accessToken))
      .expect(204)

    const afterDelete = await request(app)
      .get('/api/v1/users')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(afterDelete.body.data.some((user: { id: string }) => user.id === employee.userId)).toBe(
      false,
    )
  })
})
