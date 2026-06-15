import request from 'supertest'
import { afterEach, describe, it } from 'vitest'

import {
  app,
  authHeader,
  createUserWithRole,
  registerCompanyAndAdmin,
} from '../helpers/auth-helper.js'
import { createInvalidAccessToken } from '../helpers/factories/token.factory.js'
import { cleanupCompanies } from '../helpers/cleanup.js'
import { apiPath } from '../helpers/api-paths.js'

describe('RBAC E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('allows ADMIN to access protected user listing', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    await request(app).get(apiPath('/users')).set(authHeader(admin.accessToken)).expect(200)
  })

  it('returns 403 when USER accesses administrative routes', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const user = await createUserWithRole(admin.accessToken, 'USER')

    await request(app).get(apiPath('/users')).set(authHeader(user.accessToken)).expect(403)
    await request(app).post(apiPath('/users')).set(authHeader(user.accessToken)).expect(403)
  })

  it('returns 401 when token is missing', async () => {
    await request(app).get(apiPath('/users')).expect(401)
    await request(app).get(apiPath('/auth/me')).expect(401)
  })

  it('returns 401 when token is invalid', async () => {
    await request(app)
      .get(apiPath('/users'))
      .set(authHeader(createInvalidAccessToken()))
      .expect(401)
  })
})
