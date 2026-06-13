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
    .post('/api/categories')
    .set(authHeader(token))
    .send({ name: `Inv Category ${suffix}` })
    .expect(201)

  const supplier = await request(app)
    .post('/api/suppliers')
    .set(authHeader(token))
    .send({
      corporateName: `Inv Corp ${suffix}`,
      tradeName: `Inv Trade ${suffix}`,
      document: `inv-supplier-${suffix}`,
    })
    .expect(201)

  const product = await request(app)
    .post('/api/products')
    .set(authHeader(token))
    .send({
      categoryId: category.body.id as string,
      supplierId: supplier.body.id as string,
      name: `Inventory Product ${suffix}`,
      sku: `inv-sku-${suffix}`,
      costPrice: 10,
      salePrice: 20,
      quantity,
    })
    .expect(201)

  return product.body.id as string
}

describe('Inventory Movements E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('returns 401 when creating movement without token', async () => {
    await request(app)
      .post('/api/inventory/movements')
      .send({
        productId: 'fake',
        type: 'ENTRY',
        quantity: 1,
        reason: 'Test',
      })
      .expect(401)
  })

  it('increases stock with ENTRY movement', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProductWithStock(admin.accessToken, suffix, 10)

    const movement = await request(app)
      .post('/api/inventory/movements')
      .set(authHeader(admin.accessToken))
      .send({
        productId,
        type: 'ENTRY',
        quantity: 5,
        reason: 'Restock',
      })
      .expect(201)

    expect(movement.body).toMatchObject({
      productId,
      type: 'ENTRY',
      previousQuantity: 10,
      newQuantity: 15,
    })

    const product = await request(app)
      .get(`/api/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(product.body.quantity).toBe(15)
  })

  it('decreases stock with EXIT movement', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProductWithStock(admin.accessToken, suffix, 20)

    const movement = await request(app)
      .post('/api/inventory/movements')
      .set(authHeader(admin.accessToken))
      .send({
        productId,
        type: 'EXIT',
        quantity: 8,
        reason: 'Sale',
      })
      .expect(201)

    expect(movement.body).toMatchObject({
      type: 'EXIT',
      previousQuantity: 20,
      newQuantity: 12,
    })

    const product = await request(app)
      .get(`/api/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(product.body.quantity).toBe(12)
  })

  it('returns 400 when EXIT exceeds available stock', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProductWithStock(admin.accessToken, suffix, 3)

    const response = await request(app)
      .post('/api/inventory/movements')
      .set(authHeader(admin.accessToken))
      .send({
        productId,
        type: 'EXIT',
        quantity: 10,
        reason: 'Invalid exit',
      })
      .expect(400)

    expect(response.body.message).toBe('Insufficient stock')
  })

  it('returns 403 when employee tries to list movements', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'EMPLOYEE')

    await request(app)
      .get('/api/inventory/movements')
      .set(authHeader(employee.accessToken))
      .expect(403)
  })

  it('allows employee to create movement but not list history', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'EMPLOYEE')
    const suffix = uniqueSuffix()
    const productId = await createProductWithStock(admin.accessToken, suffix, 5)

    await request(app)
      .post('/api/inventory/movements')
      .set(authHeader(employee.accessToken))
      .send({
        productId,
        type: 'ENTRY',
        quantity: 2,
        reason: 'Employee entry',
      })
      .expect(201)

    await request(app)
      .get('/api/inventory/movements')
      .set(authHeader(employee.accessToken))
      .expect(403)
  })

  it('does not allow movement on product from another company', async () => {
    const companyA = await registerCompanyAndAdmin(`inv-a-${uniqueSuffix()}`)
    const companyB = await registerCompanyAndAdmin(`inv-b-${uniqueSuffix()}`)
    companyIds.push(companyA.companyId, companyB.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProductWithStock(companyA.accessToken, suffix, 10)

    await request(app)
      .post('/api/inventory/movements')
      .set(authHeader(companyB.accessToken))
      .send({
        productId,
        type: 'ENTRY',
        quantity: 1,
        reason: 'Cross tenant',
      })
      .expect(404)
  })
})
