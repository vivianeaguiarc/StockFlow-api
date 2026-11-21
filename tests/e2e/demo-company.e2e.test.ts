import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'

import { prisma } from '../../src/shared/database/prisma.js'
import {
  app,
  authHeader,
  createUserWithRole,
  type RegisteredCompany,
  registerCompanyAndAdmin,
} from '../helpers/auth-helper.js'
import { cleanupCompanies } from '../helpers/cleanup.js'
import { uniqueSuffix } from '../helpers/test-data.js'

async function registerDemoCompany(): Promise<RegisteredCompany> {
  const admin = await registerCompanyAndAdmin()

  // authenticate lê a empresa do banco a cada requisição, então
  // o token já emitido passa a ser tratado como "empresa demo".
  await prisma.company.update({ where: { id: admin.companyId }, data: { isDemo: true } })

  return admin
}

function expectDemoReadOnly(response: request.Response): void {
  expect(response.body.code).toBe('DEMO_READ_ONLY')
}

describe('Demo company protection E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('blocks password, email, role and status changes on demo users', async () => {
    const admin = await registerDemoCompany()
    companyIds.push(admin.companyId)

    const user = await createUserWithRole(admin.accessToken, 'USER')

    for (const [targetId, payload] of [
      [admin.userId, { password: 'Hijack@123456' }],
      [admin.userId, { email: `hijack-${uniqueSuffix()}@test.com` }],
      [user.userId, { role: 'MANAGER' }],
      [user.userId, { status: 'INACTIVE' }],
    ] as const) {
      const response = await request(app)
        .patch(`/api/v1/users/${targetId}`)
        .set(authHeader(admin.accessToken))
        .send(payload)
        .expect(403)

      expectDemoReadOnly(response)
    }

    // A senha original continua funcionando
    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: admin.password })
      .expect(200)
  })

  it('still allows harmless changes such as renaming a user', async () => {
    const admin = await registerDemoCompany()
    companyIds.push(admin.companyId)

    const user = await createUserWithRole(admin.accessToken, 'USER')

    await request(app)
      .patch(`/api/v1/users/${user.userId}`)
      .set(authHeader(admin.accessToken))
      .send({ firstName: 'Renamed' })
      .expect(200)
  })

  it('blocks deleting users and changing or deleting the company', async () => {
    const admin = await registerDemoCompany()
    companyIds.push(admin.companyId)

    const user = await createUserWithRole(admin.accessToken, 'USER')

    expectDemoReadOnly(
      await request(app)
        .delete(`/api/v1/users/${user.userId}`)
        .set(authHeader(admin.accessToken))
        .expect(403),
    )

    expectDemoReadOnly(
      await request(app)
        .patch('/api/v1/companies/me')
        .set(authHeader(admin.accessToken))
        .send({ name: 'Hacked' })
        .expect(403),
    )

    expectDemoReadOnly(
      await request(app)
        .patch(`/api/v1/companies/${admin.companyId}`)
        .set(authHeader(admin.accessToken))
        .send({ active: false })
        .expect(403),
    )

    expectDemoReadOnly(
      await request(app)
        .delete(`/api/v1/companies/${admin.companyId}`)
        .set(authHeader(admin.accessToken))
        .expect(403),
    )

    const company = await prisma.company.findUnique({ where: { id: admin.companyId } })
    expect(company?.active).toBe(true)
    expect(company?.deletedAt).toBeNull()
  })

  it('blocks deleting products, categories and suppliers but allows creating them', async () => {
    const admin = await registerDemoCompany()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()

    const category = await request(app)
      .post('/api/v1/categories')
      .set(authHeader(admin.accessToken))
      .send({ name: `Category ${suffix}` })
      .expect(201)

    const supplier = await request(app)
      .post('/api/v1/suppliers')
      .set(authHeader(admin.accessToken))
      .send({
        corporateName: `Corporate ${suffix}`,
        tradeName: `Trade ${suffix}`,
        document: `demo-supplier-${suffix}`,
      })
      .expect(201)

    const product = await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({ name: `Product ${suffix}`, sku: `DEMO-${suffix}`, price: 10 })
      .expect(201)

    for (const path of [
      `/api/v1/products/${product.body.data.id as string}`,
      `/api/v1/categories/${category.body.data.id as string}`,
      `/api/v1/suppliers/${supplier.body.data.id as string}`,
    ]) {
      expectDemoReadOnly(
        await request(app).delete(path).set(authHeader(admin.accessToken)).expect(403),
      )
    }
  })

  it('does not affect regular companies', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const user = await createUserWithRole(admin.accessToken, 'USER')

    await request(app)
      .patch(`/api/v1/users/${user.userId}`)
      .set(authHeader(admin.accessToken))
      .send({ status: 'INACTIVE' })
      .expect(200)

    await request(app)
      .delete(`/api/v1/users/${user.userId}`)
      .set(authHeader(admin.accessToken))
      .expect(204)
  })
})
