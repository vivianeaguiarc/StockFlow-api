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

async function createCategory(token: string, suffix: string): Promise<string> {
  const response = await request(app)
    .post('/api/v1/categories')
    .set(authHeader(token))
    .send({ name: `Category ${suffix}` })
    .expect(201)

  return response.body.data.id as string
}

async function createSupplier(token: string, suffix: string): Promise<string> {
  const response = await request(app)
    .post('/api/v1/suppliers')
    .set(authHeader(token))
    .send({
      corporateName: `Corporate ${suffix}`,
      tradeName: `Trade ${suffix}`,
      document: `product-supplier-${suffix}`,
    })
    .expect(201)

  return response.body.data.id as string
}

describe('Products E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('returns 401 when creating product without token', async () => {
    await request(app)
      .post('/api/v1/products')
      .send({
        name: 'Product',
        sku: `sku-${uniqueSuffix()}`,
        price: 20,
      })
      .expect(401)
  })

  it('creates product with required fields', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()

    const response = await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        name: `Product ${suffix}`,
        sku: `sku-${suffix}`,
        price: 29.9,
        quantity: 5,
        minimumStock: 2,
      })
      .expect(201)

    expect(response.body.data).toMatchObject({
      name: `Product ${suffix}`,
      sku: `sku-${suffix}`,
      price: 29.9,
      quantity: 5,
      minimumStock: 2,
      active: true,
    })
  })

  it('creates product with optional category and supplier', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const categoryId = await createCategory(admin.accessToken, suffix)
    const supplierId = await createSupplier(admin.accessToken, suffix)

    const response = await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        categoryId,
        supplierId,
        name: `Product ${suffix}`,
        sku: `sku-${suffix}`,
        price: 15.5,
        quantity: 5,
        minimumStock: 2,
      })
      .expect(201)

    expect(response.body.data).toMatchObject({
      categoryId,
      supplierId,
      name: `Product ${suffix}`,
      sku: `sku-${suffix}`,
      price: 15.5,
      quantity: 5,
    })
  })

  it('returns 409 when SKU is duplicated in the same company', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const sku = `dup-sku-${suffix}`

    await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        name: `Product A ${suffix}`,
        sku,
        price: 10,
      })
      .expect(201)

    const duplicate = await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        name: `Product B ${suffix}`,
        sku,
        price: 15,
      })
      .expect(409)

    expect(duplicate.body.success).toBe(false)
  })

  it('allows MANAGER to soft delete product', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const manager = await createUserWithRole(admin.accessToken, 'MANAGER')
    const suffix = uniqueSuffix()

    const created = await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        name: `Manager Delete ${suffix}`,
        sku: `mgr-del-${suffix}`,
        price: 10,
      })
      .expect(201)

    const productId = created.body.data.id as string

    await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set(authHeader(manager.accessToken))
      .expect(204)

    await request(app)
      .get(`/api/v1/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(404)
  })

  it('returns 403 when USER tries to update or delete product', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')
    const suffix = uniqueSuffix()

    const created = await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        name: `Protected Product ${suffix}`,
        sku: `protected-${suffix}`,
        price: 10,
      })
      .expect(201)

    const productId = created.body.data.id as string

    await request(app)
      .patch(`/api/v1/products/${productId}`)
      .set(authHeader(employee.accessToken))
      .send({ name: 'Blocked update' })
      .expect(403)

    await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set(authHeader(employee.accessToken))
      .expect(403)
  })

  it('records CREATE_PRODUCT audit log when product is created', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()

    await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        name: `Audit Product ${suffix}`,
        sku: `audit-${suffix}`,
        price: 10,
      })
      .expect(201)

    const logs = await request(app)
      .get('/api/v1/audit/logs?action=CREATE_PRODUCT&entity=Product&pageSize=5')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(
      logs.body.data.some(
        (log: { action: string; entity: string }) =>
          log.action === 'CREATE_PRODUCT' && log.entity === 'Product',
      ),
    ).toBe(true)
  })

  it('rejects product with non-positive price', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()

    await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        name: `Invalid Product ${suffix}`,
        sku: `invalid-${suffix}`,
        price: 0,
      })
      .expect(422)
  })

  it('supports list, get, update and soft delete', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()

    const created = await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        name: `CRUD Product ${suffix}`,
        sku: `crud-sku-${suffix}`,
        price: 20,
      })
      .expect(201)

    const productId = created.body.data.id as string

    const list = await request(app)
      .get('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(list.body.data.some((item: { id: string }) => item.id === productId)).toBe(true)

    const fetched = await request(app)
      .get(`/api/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(fetched.body.data.sku).toBe(`crud-sku-${suffix}`)

    const updated = await request(app)
      .patch(`/api/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .send({ name: `Updated Product ${suffix}` })
      .expect(200)

    expect(updated.body.data.name).toBe(`Updated Product ${suffix}`)

    await request(app)
      .delete(`/api/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(204)

    await request(app)
      .get(`/api/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(404)
  })

  it('returns 403 when employee tries to create product', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')
    const suffix = uniqueSuffix()

    await request(app)
      .post('/api/v1/products')
      .set(authHeader(employee.accessToken))
      .send({
        name: `Blocked Product ${suffix}`,
        sku: `blocked-${suffix}`,
        price: 20,
      })
      .expect(403)
  })

  it('allows USER role to list and get products', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')
    const suffix = uniqueSuffix()

    const created = await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        name: `Readable Product ${suffix}`,
        sku: `read-${suffix}`,
        price: 10,
      })
      .expect(201)

    const productId = created.body.data.id as string

    await request(app).get('/api/v1/products').set(authHeader(employee.accessToken)).expect(200)

    await request(app)
      .get(`/api/v1/products/${productId}`)
      .set(authHeader(employee.accessToken))
      .expect(200)
  })

  it('does not expose products from another company', async () => {
    const companyA = await registerCompanyAndAdmin(`prod-a-${uniqueSuffix()}`)
    const companyB = await registerCompanyAndAdmin(`prod-b-${uniqueSuffix()}`)
    companyIds.push(companyA.companyId, companyB.companyId)

    const suffix = uniqueSuffix()

    const created = await request(app)
      .post('/api/v1/products')
      .set(authHeader(companyA.accessToken))
      .send({
        name: `Private Product ${suffix}`,
        sku: `private-${suffix}`,
        price: 20,
      })
      .expect(201)

    const productId = created.body.data.id as string

    await request(app)
      .get(`/api/products/${productId}`)
      .set(authHeader(companyB.accessToken))
      .expect(404)
  })

  it('supports pagination, sorting and filters on list', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const categoryId = await createCategory(admin.accessToken, suffix)
    const supplierId = await createSupplier(admin.accessToken, suffix)

    await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        categoryId,
        supplierId,
        name: `Notebook ${suffix}`,
        sku: `notebook-${suffix}`,
        price: 20,
        quantity: 1,
        minimumStock: 5,
        active: true,
      })
      .expect(201)

    await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        categoryId,
        supplierId,
        name: `Mouse ${suffix}`,
        sku: `mouse-${suffix}`,
        price: 10,
        quantity: 20,
        minimumStock: 2,
        active: false,
      })
      .expect(201)

    const byName = await request(app)
      .get('/api/v1/products?name=notebook')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(byName.body.data.length).toBe(1)
    expect(byName.body.data[0].name.toLowerCase()).toContain('notebook')

    const bySku = await request(app)
      .get(`/api/v1/products?sku=mouse-${suffix}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(bySku.body.data.length).toBe(1)
    expect(bySku.body.data[0].sku).toBe(`mouse-${suffix}`)

    const activeOnly = await request(app)
      .get('/api/v1/products?active=true')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(activeOnly.body.data.every((item: { active: boolean }) => item.active)).toBe(true)

    const lowStock = await request(app)
      .get('/api/v1/products?lowStock=true')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(lowStock.body.data.length).toBeGreaterThan(0)
    expect(
      lowStock.body.data.every(
        (item: { quantity: number; minimumStock: number }) => item.quantity <= item.minimumStock,
      ),
    ).toBe(true)

    const filtered = await request(app)
      .get(`/api/products?categoryId=${categoryId}&supplierId=${supplierId}&limit=1&page=1`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(filtered.body.data).toHaveLength(1)
    expect(filtered.body.pagination).toMatchObject({
      page: 1,
      limit: 1,
      totalItems: 2,
    })
  })
})
