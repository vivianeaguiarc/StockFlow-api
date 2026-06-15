import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../../src/app.js'

const app = createApp()

function createUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function registerAndLogin(uniqueId: string): Promise<{
  email: string
  password: string
  accessToken: string
  refreshToken: string
}> {
  const email = `login-${uniqueId}@test.com`
  const password = 'Test@123456'

  await request(app)
    .post('/api/v1/auth/register')
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
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200)

  return {
    email,
    password,
    accessToken: response.body.accessToken as string,
    refreshToken: response.body.refreshToken as string,
  }
}

describe('POST /api/auth/register', () => {
  it('creates company and admin user', async () => {
    const uniqueId = createUniqueId()

    const response = await request(app)
      .post('/api/v1/auth/register')
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
  it('returns accessToken and refreshToken for valid credentials', async () => {
    const uniqueId = createUniqueId()
    const session = await registerAndLogin(uniqueId)

    expect(typeof session.accessToken).toBe('string')
    expect(session.accessToken.length).toBeGreaterThan(0)
    expect(typeof session.refreshToken).toBe('string')
    expect(session.refreshToken.length).toBeGreaterThan(0)
  })

  it('returns 401 for invalid credentials', async () => {
    const uniqueId = createUniqueId()
    const session = await registerAndLogin(uniqueId)

    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: session.email, password: 'Wrong@123456' })
      .expect(401)

    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'unknown@example.com', password: 'Test@123456' })
      .expect(401)
  })
})

describe('POST /api/auth/refresh', () => {
  it('returns new access and refresh tokens and revokes the old refresh token', async () => {
    const uniqueId = createUniqueId()
    const session = await registerAndLogin(uniqueId)

    const refreshed = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken })
      .expect(200)

    expect(typeof refreshed.body.accessToken).toBe('string')
    expect(typeof refreshed.body.refreshToken).toBe('string')
    expect(refreshed.body.refreshToken).not.toBe(session.refreshToken)

    await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken })
      .expect(401)

    await request(app)
      .get('/api/v1/me')
      .set('Authorization', `Bearer ${refreshed.body.accessToken as string}`)
      .expect(200)
  })

  it('returns 401 for invalid refresh token', async () => {
    await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid-token' })
      .expect(401)
  })
})

describe('GET /api/v1/auth/me', () => {
  it('returns 401 without token', async () => {
    await request(app).get('/api/v1/auth/me').expect(401)
  })

  it('returns authenticated user profile', async () => {
    const uniqueId = createUniqueId()
    const session = await registerAndLogin(uniqueId)

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .expect(200)

    expect(response.body).toMatchObject({
      email: session.email,
      role: 'ADMIN',
      name: 'Login User',
    })
    expect(response.body.id).toEqual(expect.any(String))
    expect(response.body.createdAt).toEqual(expect.any(String))
    expect(response.body.updatedAt).toEqual(expect.any(String))
    expect(response.body.password).toBeUndefined()
    expect(response.body.passwordHash).toBeUndefined()
  })
})

describe('POST /api/auth/logout', () => {
  it('revokes refresh token and blocks subsequent refresh', async () => {
    const uniqueId = createUniqueId()
    const session = await registerAndLogin(uniqueId)

    await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken: session.refreshToken })
      .expect(204)

    await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken })
      .expect(401)
  })

  it('returns 204 even for invalid refresh token', async () => {
    await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken: 'invalid-token' })
      .expect(204)
  })
})
