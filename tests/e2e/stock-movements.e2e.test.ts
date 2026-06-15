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
