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

async function createProduct(token: string, suffix: string, quantity = 10): Promise<string> {
  const response = await request(app)
    .post('/api/v1/products')
    .set(authHeader(token))
    .send({
      name: `Stock Product ${suffix}`,
      sku: `stock-${suffix}`,
      price: 20,
      quantity,
    })
    .expect(201)

  return response.body.data.id as string
}

describe('Stock Movements E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('returns 401 without token', async () => {
    await request(app)
      .post('/api/v1/products/fake/stock-movements')
      .send({ type: 'IN', quantity: 1 })
      .expect(401)
  })

  it('increases stock with IN movement', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProduct(admin.accessToken, suffix, 10)

    const movement = await request(app)
      .post(`/api/v1/products/${productId}/stock-movements`)
      .set(authHeader(admin.accessToken))
      .send({ type: 'IN', quantity: 5, reason: 'Purchase' })
      .expect(201)

    expect(movement.body.data).toMatchObject({
      productId,
      type: 'IN',
      previousQuantity: 10,
      newQuantity: 15,
    })

    const product = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(product.body.data.quantity).toBe(15)
  })

  it('decreases stock with OUT movement', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProduct(admin.accessToken, suffix, 20)

    const movement = await request(app)
      .post(`/api/v1/products/${productId}/stock-movements`)
      .set(authHeader(admin.accessToken))
      .send({ type: 'OUT', quantity: 8, reason: 'Sale' })
      .expect(201)

    expect(movement.body.data).toMatchObject({
      type: 'OUT',
      previousQuantity: 20,
      newQuantity: 12,
    })
  })

  it('returns 409 when OUT exceeds available stock', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProduct(admin.accessToken, suffix, 3)

    const response = await request(app)
      .post(`/api/v1/products/${productId}/stock-movements`)
      .set(authHeader(admin.accessToken))
      .send({ type: 'OUT', quantity: 10, reason: 'Invalid' })
      .expect(409)

    expect(response.body.message).toBe('Insufficient stock')
  })

  it('sets stock with ADJUSTMENT movement', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProduct(admin.accessToken, suffix, 10)

    await request(app)
      .post(`/api/v1/products/${productId}/stock-movements`)
      .set(authHeader(admin.accessToken))
      .send({ type: 'ADJUSTMENT', quantity: 42, reason: 'Inventory count' })
      .expect(201)

    const product = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(product.body.data.quantity).toBe(42)
  })

  it('returns 404 for non-existent product', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    await request(app)
      .post('/api/v1/products/non-existent-id/stock-movements')
      .set(authHeader(admin.accessToken))
      .send({ type: 'IN', quantity: 1 })
      .expect(404)
  })

  it('returns 404 for soft-deleted product', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProduct(admin.accessToken, suffix, 10)

    await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(204)

    await request(app)
      .post(`/api/v1/products/${productId}/stock-movements`)
      .set(authHeader(admin.accessToken))
      .send({ type: 'IN', quantity: 1 })
      .expect(404)
  })

  it('returns 403 when USER tries to create stock movement', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')
    const suffix = uniqueSuffix()
    const productId = await createProduct(admin.accessToken, suffix, 5)

    await request(app)
      .post(`/api/v1/products/${productId}/stock-movements`)
      .set(authHeader(employee.accessToken))
      .send({ type: 'IN', quantity: 1 })
      .expect(403)
  })

  it('allows MANAGER to create stock movement', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const manager = await createUserWithRole(admin.accessToken, 'MANAGER')
    const suffix = uniqueSuffix()
    const productId = await createProduct(admin.accessToken, suffix, 5)

    await request(app)
      .post(`/api/v1/products/${productId}/stock-movements`)
      .set(authHeader(manager.accessToken))
      .send({ type: 'IN', quantity: 2 })
      .expect(201)
  })

  it('records CREATE_STOCK_MOVEMENT audit log', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProduct(admin.accessToken, suffix, 5)

    await request(app)
      .post(`/api/v1/products/${productId}/stock-movements`)
      .set(authHeader(admin.accessToken))
      .send({ type: 'IN', quantity: 1, reason: 'Audit test' })
      .expect(201)

    const logs = await request(app)
      .get('/api/v1/audit/logs?action=CREATE_STOCK_MOVEMENT&entity=StockMovement&pageSize=5')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(
      logs.body.data.some(
        (log: { action: string; entity: string }) =>
          log.action === 'CREATE_STOCK_MOVEMENT' && log.entity === 'StockMovement',
      ),
    ).toBe(true)
  })
})

describe('Stock Movements History E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  async function seedMovements(token: string, suffix: string) {
    const productA = await request(app)
      .post('/api/v1/products')
      .set(authHeader(token))
      .send({ name: `History A ${suffix}`, sku: `hist-a-${suffix}`, price: 10, quantity: 10 })
      .expect(201)

    const productB = await request(app)
      .post('/api/v1/products')
      .set(authHeader(token))
      .send({ name: `History B ${suffix}`, sku: `hist-b-${suffix}`, price: 10, quantity: 5 })
      .expect(201)

    const productAId = productA.body.data.id as string
    const productBId = productB.body.data.id as string

    await request(app)
      .post(`/api/v1/products/${productAId}/stock-movements`)
      .set(authHeader(token))
      .send({ type: 'IN', quantity: 3, reason: 'Entry A' })
      .expect(201)

    await request(app)
      .post(`/api/v1/products/${productBId}/stock-movements`)
      .set(authHeader(token))
      .send({ type: 'OUT', quantity: 2, reason: 'Exit B' })
      .expect(201)

    return { productAId, productBId }
  }

  it('lists general stock movement history', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    await seedMovements(admin.accessToken, suffix)

    const response = await request(app)
      .get('/api/v1/stock-movements')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data.length).toBeGreaterThanOrEqual(2)
    expect(response.body.data[0]).toMatchObject({
      id: expect.any(String),
      productId: expect.any(String),
      productName: expect.any(String),
      userId: admin.userId,
      userEmail: admin.email,
      type: expect.stringMatching(/IN|OUT|ADJUSTMENT/),
      quantity: expect.any(Number),
      previousQuantity: expect.any(Number),
      newQuantity: expect.any(Number),
      createdAt: expect.any(String),
    })
  })

  it('lists history scoped to a product', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const { productAId } = await seedMovements(admin.accessToken, suffix)

    const response = await request(app)
      .get(`/api/v1/products/${productAId}/stock-movements`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data.length).toBeGreaterThanOrEqual(1)
    expect(
      response.body.data.every((item: { productId: string }) => item.productId === productAId),
    ).toBe(true)
  })

  it('filters history by movement type', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    await seedMovements(admin.accessToken, suffix)

    const response = await request(app)
      .get('/api/v1/stock-movements?type=OUT')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data.length).toBeGreaterThanOrEqual(1)
    expect(response.body.data.every((item: { type: string }) => item.type === 'OUT')).toBe(true)
  })

  it('supports pagination with page and limit', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    await seedMovements(admin.accessToken, suffix)

    const response = await request(app)
      .get('/api/v1/stock-movements?page=1&limit=1')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data).toHaveLength(1)
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 1,
      totalItems: expect.any(Number),
    })
  })

  it('orders history by createdAt desc', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProduct(admin.accessToken, suffix, 10)

    await request(app)
      .post(`/api/v1/products/${productId}/stock-movements`)
      .set(authHeader(admin.accessToken))
      .send({ type: 'IN', quantity: 1 })
      .expect(201)

    await new Promise((resolve) => setTimeout(resolve, 20))

    await request(app)
      .post(`/api/v1/products/${productId}/stock-movements`)
      .set(authHeader(admin.accessToken))
      .send({ type: 'IN', quantity: 2 })
      .expect(201)

    const response = await request(app)
      .get(`/api/v1/products/${productId}/stock-movements?limit=2`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    const [first, second] = response.body.data as Array<{ createdAt: string }>
    expect(new Date(first.createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(second.createdAt).getTime(),
    )
  })

  it('allows USER to consult stock movement history', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')
    const suffix = uniqueSuffix()
    await seedMovements(admin.accessToken, suffix)

    await request(app)
      .get('/api/v1/stock-movements')
      .set(authHeader(employee.accessToken))
      .expect(200)
  })

  it('returns 404 when productId filter does not exist', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    await request(app)
      .get('/api/v1/stock-movements?productId=non-existent-product')
      .set(authHeader(admin.accessToken))
      .expect(404)
  })

  it('returns 404 when listing history for non-existent product route', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    await request(app)
      .get('/api/v1/products/non-existent-product/stock-movements')
      .set(authHeader(admin.accessToken))
      .expect(404)
  })

  it('filters history by date range', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    await seedMovements(admin.accessToken, suffix)

    const startDate = encodeURIComponent('2020-01-01T00:00:00.000Z')
    const endDate = encodeURIComponent('2099-12-31T23:59:59.999Z')

    const response = await request(app)
      .get(`/api/v1/stock-movements?startDate=${startDate}&endDate=${endDate}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data.length).toBeGreaterThanOrEqual(2)
  })
})
