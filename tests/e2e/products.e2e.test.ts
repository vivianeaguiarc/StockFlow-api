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

  return response.body.id as string
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

  return response.body.id as string
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
        categoryId: 'fake',
        supplierId: 'fake',
        name: 'Product',
        sku: `sku-${uniqueSuffix()}`,
        costPrice: 10,
        salePrice: 20,
      })
      .expect(401)
  })

  it('creates product with valid category and supplier', async () => {
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
        costPrice: 15.5,
        salePrice: 29.9,
        quantity: 5,
        minimumStock: 2,
      })
      .expect(201)

    expect(response.body).toMatchObject({
      categoryId,
      supplierId,
      name: `Product ${suffix}`,
      sku: `sku-${suffix}`,
      quantity: 5,
    })
  })

  it('supports list, get, update and soft delete', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const categoryId = await createCategory(admin.accessToken, suffix)
    const supplierId = await createSupplier(admin.accessToken, suffix)

    const created = await request(app)
      .post('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .send({
        categoryId,
        supplierId,
        name: `CRUD Product ${suffix}`,
        sku: `crud-sku-${suffix}`,
        costPrice: 10,
        salePrice: 20,
      })
      .expect(201)

    const productId = created.body.id as string

    const list = await request(app)
      .get('/api/v1/products')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(list.body.data.some((item: { id: string }) => item.id === productId)).toBe(true)

    const fetched = await request(app)
      .get(`/api/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(fetched.body.sku).toBe(`crud-sku-${suffix}`)

    const updated = await request(app)
      .patch(`/api/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .send({ name: `Updated Product ${suffix}` })
      .expect(200)

    expect(updated.body.name).toBe(`Updated Product ${suffix}`)

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

    const employee = await createUserWithRole(admin.accessToken, 'EMPLOYEE')
    const suffix = uniqueSuffix()
    const categoryId = await createCategory(admin.accessToken, suffix)
    const supplierId = await createSupplier(admin.accessToken, suffix)

    await request(app)
      .post('/api/v1/products')
      .set(authHeader(employee.accessToken))
      .send({
        categoryId,
        supplierId,
        name: `Blocked Product ${suffix}`,
        sku: `blocked-${suffix}`,
        costPrice: 10,
        salePrice: 20,
      })
      .expect(403)
  })

  it('does not expose products from another company', async () => {
    const companyA = await registerCompanyAndAdmin(`prod-a-${uniqueSuffix()}`)
    const companyB = await registerCompanyAndAdmin(`prod-b-${uniqueSuffix()}`)
    companyIds.push(companyA.companyId, companyB.companyId)

    const suffix = uniqueSuffix()
    const categoryId = await createCategory(companyA.accessToken, suffix)
    const supplierId = await createSupplier(companyA.accessToken, suffix)

    const created = await request(app)
      .post('/api/v1/products')
      .set(authHeader(companyA.accessToken))
      .send({
        categoryId,
        supplierId,
        name: `Private Product ${suffix}`,
        sku: `private-${suffix}`,
        costPrice: 10,
        salePrice: 20,
      })
      .expect(201)

    const productId = created.body.id as string

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
        costPrice: 10,
        salePrice: 20,
        quantity: 1,
        minimumStock: 5,
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
        costPrice: 5,
        salePrice: 10,
        quantity: 20,
        minimumStock: 2,
      })
      .expect(201)

    const search = await request(app)
      .get('/api/v1/products?search=notebook')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(search.body.data.length).toBe(1)
    expect(search.body.data[0].name.toLowerCase()).toContain('notebook')

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
      .get(`/api/products?categoryId=${categoryId}&supplierId=${supplierId}&pageSize=1`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(filtered.body.data).toHaveLength(1)
    expect(filtered.body.meta.totalItems).toBeGreaterThanOrEqual(2)
  })
})
