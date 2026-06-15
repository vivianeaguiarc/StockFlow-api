import request from 'supertest'

import { createApp } from '../../src/app.js'
import { getAuthTokens, getResponseData } from './api-response.js'
import { apiPath } from './api-paths.js'
import { DEFAULT_TEST_PASSWORD, uniqueSuffix } from './test-data.js'

export const app = createApp()

export type AuthSession = {
  accessToken: string
  userId: string
  companyId: string
  email: string
  password: string
}

export type RegisteredCompany = AuthSession & {
  companyName: string
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` }
}

export async function registerCompanyAndAdmin(suffix = uniqueSuffix()): Promise<RegisteredCompany> {
  const adminEmail = `admin-${suffix}@test.com`
  const companyName = `Test Company ${suffix}`

  const registerResponse = await request(app)
    .post(apiPath('/auth/register'))
    .send({
      company: {
        name: companyName,
        document: `doc-${suffix}`,
        email: `company-${suffix}@test.com`,
      },
      admin: {
        firstName: 'Test',
        lastName: 'Admin',
        email: adminEmail,
        password: DEFAULT_TEST_PASSWORD,
      },
    })
    .expect(201)

  const registerData = getResponseData<{
    company: { id: string }
    admin: { id: string }
  }>(registerResponse.body)

  const loginResponse = await request(app)
    .post(apiPath('/auth/login'))
    .send({ email: adminEmail, password: DEFAULT_TEST_PASSWORD })
    .expect(200)

  const { accessToken } = getAuthTokens(loginResponse.body)

  return {
    accessToken,
    userId: registerData.admin.id,
    companyId: registerData.company.id,
    email: adminEmail,
    password: DEFAULT_TEST_PASSWORD,
    companyName,
  }
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await request(app)
    .post(apiPath('/auth/login'))
    .send({ email, password })
    .expect(200)

  const loginData = getResponseData<{
    accessToken: string
    user: { id: string; companyId: string }
  }>(response.body)

  return {
    accessToken: loginData.accessToken,
    userId: loginData.user.id,
    companyId: loginData.user.companyId,
    email,
    password,
  }
}

export async function createUserWithRole(
  adminToken: string,
  role: 'MANAGER' | 'USER',
  suffix = uniqueSuffix(),
): Promise<AuthSession> {
  const email = `${role.toLowerCase()}-${suffix}@test.com`

  await request(app)
    .post(apiPath('/users'))
    .set(authHeader(adminToken))
    .send({
      firstName: role,
      lastName: 'User',
      email,
      password: DEFAULT_TEST_PASSWORD,
      role,
    })
    .expect(201)

  return login(email, DEFAULT_TEST_PASSWORD)
}
