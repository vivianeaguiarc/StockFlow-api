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

    expect(updated.body.data.firstName).toBe('ManagerUpdated')

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

    const userId = created.body.data.id as string

    const list = await request(app)
      .get('/api/v1/users')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(list.body.data.some((user: { id: string }) => user.id === userId)).toBe(true)

    const fetched = await request(app)
      .get(`/api/users/${userId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(fetched.body.data.email).toBe(email)

    const updated = await request(app)
      .patch(`/api/users/${userId}`)
      .set(authHeader(admin.accessToken))
      .send({ firstName: 'UpdatedManager' })
      .expect(200)

    expect(updated.body.data.firstName).toBe('UpdatedManager')

    await request(app).delete(`/api/users/${userId}`).set(authHeader(admin.accessToken)).expect(204)

    await request(app).get(`/api/users/${userId}`).set(authHeader(admin.accessToken)).expect(404)
  })

  it('returns 404 when deleting an already soft-deleted user', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const target = await createUserWithRole(admin.accessToken, 'USER')

    await request(app)
      .delete(`/api/v1/users/${target.userId}`)
      .set(authHeader(admin.accessToken))
      .expect(204)

    await request(app)
      .delete(`/api/v1/users/${target.userId}`)
      .set(authHeader(admin.accessToken))
      .expect(404)
  })

  it('returns 404 when updating a soft-deleted user', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const target = await createUserWithRole(admin.accessToken, 'USER')

    await request(app)
      .delete(`/api/v1/users/${target.userId}`)
      .set(authHeader(admin.accessToken))
      .expect(204)

    await request(app)
      .patch(`/api/v1/users/${target.userId}`)
      .set(authHeader(admin.accessToken))
      .send({ firstName: 'ShouldFail' })
      .expect(404)
  })

  it('blocks login for a soft-deleted user', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const target = await createUserWithRole(admin.accessToken, 'USER')

    await request(app)
      .delete(`/api/v1/users/${target.userId}`)
      .set(authHeader(admin.accessToken))
      .expect(204)

    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: target.email, password: target.password })
      .expect(401)
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

    expect(managers.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number),
      hasNextPage: expect.any(Boolean),
      hasPreviousPage: false,
    })
    expect(managers.body.data.every((user: { role: string }) => user.role === 'MANAGER')).toBe(true)

    const nameFilter = await request(app)
      .get('/api/v1/users?name=vivi')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(
      nameFilter.body.data.some((user: { firstName: string }) =>
        user.firstName.toLowerCase().includes('vivi'),
      ),
    ).toBe(true)

    const page1 = await request(app)
      .get('/api/v1/users?page=1&limit=1&sortBy=createdAt&sortOrder=asc')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(page1.body.data).toHaveLength(1)
    expect(page1.body.pagination.limit).toBe(1)

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

  it('uses default pagination when page and limit are omitted', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const response = await request(app)
      .get('/api/v1/users')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    })
  })

  it('supports custom pagination with page and limit', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    await createUserWithRole(admin.accessToken, 'USER', 'custom-page-1')
    await createUserWithRole(admin.accessToken, 'USER', 'custom-page-2')
    await createUserWithRole(admin.accessToken, 'USER', 'custom-page-3')

    const response = await request(app)
      .get('/api/v1/users?page=2&limit=2')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data).toHaveLength(2)
    expect(response.body.pagination).toMatchObject({
      page: 2,
      limit: 2,
      totalItems: 4,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })

  it('accepts the maximum limit of 100', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const response = await request(app)
      .get('/api/v1/users?limit=100')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.pagination.limit).toBe(100)
  })

  it('rejects limit above the maximum', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    await request(app).get('/api/v1/users?limit=101').set(authHeader(admin.accessToken)).expect(400)
  })

  it('returns empty data for a page beyond the last page', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const response = await request(app)
      .get('/api/v1/users?page=99&limit=10')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data).toEqual([])
    expect(response.body.pagination).toMatchObject({
      page: 99,
      limit: 10,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })

  describe('filters', () => {
    it('filters users by name', async () => {
      const admin = await registerCompanyAndAdmin()
      companyIds.push(admin.companyId)

      const suffix = uniqueSuffix()

      await request(app)
        .post('/api/v1/users')
        .set(authHeader(admin.accessToken))
        .send({
          firstName: 'Vivi',
          lastName: 'Filter',
          email: `vivi-filter-${suffix}@test.com`,
          password: 'Test@123456',
          role: 'USER',
        })
        .expect(201)

      const response = await request(app)
        .get('/api/v1/users?name=vivi')
        .set(authHeader(admin.accessToken))
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      expect(
        response.body.data.every(
          (user: { firstName: string; lastName: string }) =>
            user.firstName.toLowerCase().includes('vivi') ||
            user.lastName.toLowerCase().includes('vivi'),
        ),
      ).toBe(true)
    })

    it('filters users by email', async () => {
      const admin = await registerCompanyAndAdmin()
      companyIds.push(admin.companyId)

      const suffix = uniqueSuffix()
      const email = `gmail-user-${suffix}@gmail.com`

      await request(app)
        .post('/api/v1/users')
        .set(authHeader(admin.accessToken))
        .send({
          firstName: 'Gmail',
          lastName: 'User',
          email,
          password: 'Test@123456',
          role: 'USER',
        })
        .expect(201)

      const response = await request(app)
        .get('/api/v1/users?email=gmail')
        .set(authHeader(admin.accessToken))
        .expect(200)

      expect(response.body.data.some((user: { email: string }) => user.email === email)).toBe(true)
      expect(
        response.body.data.every((user: { email: string }) => user.email.includes('gmail')),
      ).toBe(true)
    })

    it('filters users by role', async () => {
      const admin = await registerCompanyAndAdmin()
      companyIds.push(admin.companyId)

      await createUserWithRole(admin.accessToken, 'MANAGER')

      const response = await request(app)
        .get('/api/v1/users?role=MANAGER')
        .set(authHeader(admin.accessToken))
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.data.every((user: { role: string }) => user.role === 'MANAGER')).toBe(
        true,
      )
      expect(response.body.pagination.totalItems).toBe(response.body.data.length)
    })

    it('combines filters with pagination metadata', async () => {
      const admin = await registerCompanyAndAdmin()
      companyIds.push(admin.companyId)

      const suffix = uniqueSuffix()

      await request(app)
        .post('/api/v1/users')
        .set(authHeader(admin.accessToken))
        .send({
          firstName: 'Combo',
          lastName: 'Manager',
          email: `combo-manager-${suffix}@company.com`,
          password: 'Test@123456',
          role: 'MANAGER',
        })
        .expect(201)

      await createUserWithRole(admin.accessToken, 'MANAGER', `combo-2-${suffix}`)

      const response = await request(app)
        .get('/api/v1/users?page=1&limit=1&role=MANAGER')
        .set(authHeader(admin.accessToken))
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].role).toBe('MANAGER')
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 1,
        totalItems: 2,
        totalPages: 2,
        hasNextPage: true,
        hasPreviousPage: false,
      })
    })

    it('returns 400 for invalid role filter', async () => {
      const admin = await registerCompanyAndAdmin()
      companyIds.push(admin.companyId)

      const response = await request(app)
        .get('/api/v1/users?role=INVALID')
        .set(authHeader(admin.accessToken))
        .expect(400)

      expect(response.body.message).toContain('Role must be ADMIN, MANAGER or USER')
    })
  })
})
