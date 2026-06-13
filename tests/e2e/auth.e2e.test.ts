import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../../src/app.js'

const app = createApp()

function createUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

describe('POST /api/auth/register', () => {
  it('creates company and admin user', async () => {
    const uniqueId = createUniqueId()

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        company: {
          name: `Test Company ${uniqueId}`,
          document: `doc-${uniqueId}`,
          email: `company-${uniqueId}@test.com`,
        },
        admin: {
          firstName: 'Test',
          lastName: 'Admin',
          email: `admin-${uniqueId}@test.com`,
          password: 'Test@123456',
        },
      })
      .expect(201)

    expect(response.body.company).toMatchObject({
      name: `Test Company ${uniqueId}`,
      email: `company-${uniqueId}@test.com`,
    })
    expect(response.body.company.id).toEqual(expect.any(String))
    expect(response.body.admin).toMatchObject({
      firstName: 'Test',
      lastName: 'Admin',
      email: `admin-${uniqueId}@test.com`,
      role: 'ADMIN',
    })
    expect(response.body.admin.id).toEqual(expect.any(String))
  })
})

describe('POST /api/auth/login', () => {
  it('returns accessToken for valid credentials', async () => {
    const uniqueId = createUniqueId()
    const email = `login-${uniqueId}@test.com`
    const password = 'Test@123456'

    await request(app)
      .post('/api/auth/register')
      .send({
        company: {
          name: `Login Company ${uniqueId}`,
          document: `login-doc-${uniqueId}`,
          email: `login-company-${uniqueId}@test.com`,
        },
        admin: {
          firstName: 'Login',
          lastName: 'User',
          email,
          password,
        },
      })
      .expect(201)

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200)

    expect(typeof response.body.accessToken).toBe('string')
    expect(response.body.accessToken.length).toBeGreaterThan(0)
    expect(response.body.user).toMatchObject({
      email,
      role: 'ADMIN',
    })
    expect(response.body.user.id).toEqual(expect.any(String))
    expect(response.body.user.companyId).toEqual(expect.any(String))
  })
})
