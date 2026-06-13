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

describe('Suppliers E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('returns 401 when creating supplier without token', async () => {
    await request(app)
      .post('/api/suppliers')
      .send({
        corporateName: 'Corp',
        tradeName: 'Trade',
        document: `doc-${uniqueSuffix()}`,
      })
      .expect(401)
  })

  it('supports create, list, get, update and soft delete', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()

    const created = await request(app)
      .post('/api/suppliers')
      .set(authHeader(admin.accessToken))
      .send({
        corporateName: `Corporate ${suffix}`,
        tradeName: `Trade ${suffix}`,
        document: `supplier-doc-${suffix}`,
        email: `supplier-${suffix}@test.com`,
      })
      .expect(201)

    const supplierId = created.body.id as string

    const list = await request(app)
      .get('/api/suppliers')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(list.body.data.some((item: { id: string }) => item.id === supplierId)).toBe(true)

    const fetched = await request(app)
      .get(`/api/suppliers/${supplierId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(fetched.body.document).toBe(`supplier-doc-${suffix}`)

    const updated = await request(app)
      .patch(`/api/suppliers/${supplierId}`)
      .set(authHeader(admin.accessToken))
      .send({ tradeName: `Updated Trade ${suffix}` })
      .expect(200)

    expect(updated.body.tradeName).toBe(`Updated Trade ${suffix}`)

    await request(app)
      .delete(`/api/suppliers/${supplierId}`)
      .set(authHeader(admin.accessToken))
      .expect(204)

    await request(app)
      .get(`/api/suppliers/${supplierId}`)
      .set(authHeader(admin.accessToken))
      .expect(404)
  })

  it('returns 403 when manager tries to delete supplier', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const manager = await createUserWithRole(admin.accessToken, 'MANAGER')
    const suffix = uniqueSuffix()

    const created = await request(app)
      .post('/api/suppliers')
      .set(authHeader(manager.accessToken))
      .send({
        corporateName: `Corp ${suffix}`,
        tradeName: `Trade ${suffix}`,
        document: `mgr-doc-${suffix}`,
      })
      .expect(201)

    await request(app)
      .delete(`/api/suppliers/${created.body.id as string}`)
      .set(authHeader(manager.accessToken))
      .expect(403)
  })

  it('does not expose suppliers from another company', async () => {
    const companyA = await registerCompanyAndAdmin(`sup-a-${uniqueSuffix()}`)
    const companyB = await registerCompanyAndAdmin(`sup-b-${uniqueSuffix()}`)
    companyIds.push(companyA.companyId, companyB.companyId)

    const suffix = uniqueSuffix()

    const created = await request(app)
      .post('/api/suppliers')
      .set(authHeader(companyA.accessToken))
      .send({
        corporateName: `Corp ${suffix}`,
        tradeName: `Trade ${suffix}`,
        document: `private-doc-${suffix}`,
      })
      .expect(201)

    const supplierId = created.body.id as string

    await request(app)
      .get(`/api/suppliers/${supplierId}`)
      .set(authHeader(companyB.accessToken))
      .expect(404)
  })
})
