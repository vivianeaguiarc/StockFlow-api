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

async function createProductWithStock(
  token: string,
  suffix: string,
  quantity: number,
): Promise<string> {
  const category = await request(app)
    .post('/api/v1/categories')
    .set(authHeader(token))
    .send({ name: `Inv Category ${suffix}` })
    .expect(201)

  const supplier = await request(app)
    .post('/api/v1/suppliers')
    .set(authHeader(token))
    .send({
      corporateName: `Inv Corp ${suffix}`,
      tradeName: `Inv Trade ${suffix}`,
      document: `inv-supplier-${suffix}`,
    })
    .expect(201)

  const product = await request(app)
    .post('/api/v1/products')
    .set(authHeader(token))
    .send({
      categoryId: category.body.data.id as string,
      supplierId: supplier.body.data.id as string,
      name: `Inventory Product ${suffix}`,
      sku: `inv-sku-${suffix}`,
      price: 20,
      quantity,
    })
    .expect(201)

  return product.body.data.id as string
}

describe('Inventory Movements E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('returns 401 when creating movement without token', async () => {
    await request(app)
      .post('/api/v1/inventory/movements')
      .send({
        productId: 'fake',
        type: 'IN',
        quantity: 1,
        reason: 'Test',
      })
      .expect(401)
  })

  it('increases stock with IN movement', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProductWithStock(admin.accessToken, suffix, 10)

    const movement = await request(app)
      .post('/api/v1/inventory/movements')
      .set(authHeader(admin.accessToken))
      .send({
        productId,
        type: 'IN',
        quantity: 5,
        reason: 'Restock',
      })
      .expect(201)

    expect(movement.body.data).toMatchObject({
      productId,
      type: 'IN',
      previousQuantity: 10,
      newQuantity: 15,
    })

    const product = await request(app)
      .get(`/api/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(product.body.data.quantity).toBe(15)
  })

  it('decreases stock with OUT movement', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProductWithStock(admin.accessToken, suffix, 20)

    const movement = await request(app)
      .post('/api/v1/inventory/movements')
      .set(authHeader(admin.accessToken))
      .send({
        productId,
        type: 'OUT',
        quantity: 8,
        reason: 'Sale',
      })
      .expect(201)

    expect(movement.body.data).toMatchObject({
      type: 'OUT',
      previousQuantity: 20,
      newQuantity: 12,
    })

    const product = await request(app)
      .get(`/api/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(product.body.data.quantity).toBe(12)
  })

  it('returns 409 when OUT exceeds available stock', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProductWithStock(admin.accessToken, suffix, 3)

    const response = await request(app)
      .post('/api/v1/inventory/movements')
      .set(authHeader(admin.accessToken))
      .send({
        productId,
        type: 'OUT',
        quantity: 10,
        reason: 'Invalid exit',
      })
      .expect(409)

    expect(response.body.message).toBe('Insufficient stock')
  })

  it('returns 403 when employee tries to list movements', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')

    await request(app)
      .get('/api/v1/inventory/movements')
      .set(authHeader(employee.accessToken))
      .expect(403)
  })

  it('returns 403 when employee tries to create movement', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')
    const suffix = uniqueSuffix()
    const productId = await createProductWithStock(admin.accessToken, suffix, 5)

    await request(app)
      .post('/api/v1/inventory/movements')
      .set(authHeader(employee.accessToken))
      .send({
        productId,
        type: 'IN',
        quantity: 2,
        reason: 'Employee entry',
      })
      .expect(403)
  })

  it('does not allow movement on product from another company', async () => {
    const companyA = await registerCompanyAndAdmin(`inv-a-${uniqueSuffix()}`)
    const companyB = await registerCompanyAndAdmin(`inv-b-${uniqueSuffix()}`)
    companyIds.push(companyA.companyId, companyB.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProductWithStock(companyA.accessToken, suffix, 10)

    await request(app)
      .post('/api/v1/inventory/movements')
      .set(authHeader(companyB.accessToken))
      .send({
        productId,
        type: 'IN',
        quantity: 1,
        reason: 'Cross tenant',
      })
      .expect(404)
  })
})
