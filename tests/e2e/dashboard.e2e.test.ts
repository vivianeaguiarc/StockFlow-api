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

async function createLowStockProduct(token: string, suffix: string): Promise<string> {
  const category = await request(app)
    .post('/api/v1/categories')
    .set(authHeader(token))
    .send({ name: `Dash Category ${suffix}` })
    .expect(201)

  const supplier = await request(app)
    .post('/api/v1/suppliers')
    .set(authHeader(token))
    .send({
      corporateName: `Dash Corp ${suffix}`,
      tradeName: `Dash Trade ${suffix}`,
      document: `dash-supplier-${suffix}`,
    })
    .expect(201)

  const product = await request(app)
    .post('/api/v1/products')
    .set(authHeader(token))
    .send({
      categoryId: category.body.data.id as string,
      supplierId: supplier.body.data.id as string,
      name: `Low Stock Product ${suffix}`,
      sku: `dash-low-${suffix}`,
      price: 20,
      quantity: 2,
      minimumStock: 5,
    })
    .expect(201)

  return product.body.data.id as string
}

describe('Dashboard E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('returns 401 when accessing dashboard without token', async () => {
    await request(app).get('/api/v1/dashboard/summary').expect(401)
  })

  it('returns summary metrics for admin', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    await createLowStockProduct(admin.accessToken, suffix)

    await request(app)
      .post('/api/v1/inventory/movements')
      .set(authHeader(admin.accessToken))
      .send({
        productId: await createLowStockProduct(admin.accessToken, `${suffix}-move`),
        type: 'IN',
        quantity: 1,
        reason: 'Dashboard entry',
      })
      .expect(201)

    const summary = await request(app)
      .get('/api/v1/dashboard/summary')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(summary.body.data).toMatchObject({
      totalUsers: expect.any(Number),
      totalCategories: expect.any(Number),
      totalSuppliers: expect.any(Number),
      totalProducts: expect.any(Number),
      activeProducts: expect.any(Number),
      inactiveProducts: expect.any(Number),
      lowStockProducts: expect.any(Number),
      totalInventoryMovements: expect.any(Number),
      entriesToday: expect.any(Number),
      exitsToday: expect.any(Number),
      adjustmentsToday: expect.any(Number),
    })

    expect(summary.body.data.totalUsers).toBeGreaterThanOrEqual(1)
    expect(summary.body.data.lowStockProducts).toBeGreaterThanOrEqual(2)
    expect(summary.body.data.entriesToday).toBeGreaterThanOrEqual(1)
  })

  it('returns low stock products with category and supplier', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createLowStockProduct(admin.accessToken, suffix)

    const response = await request(app)
      .get('/api/v1/dashboard/low-stock-products')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data.length).toBeGreaterThan(0)

    const product = response.body.data.find((item: { id: string }) => item.id === productId)

    expect(product).toMatchObject({
      id: productId,
      name: expect.stringContaining('Low Stock Product'),
      sku: expect.stringContaining('dash-low'),
      quantity: 2,
      minimumStock: 5,
      category: {
        id: expect.any(String),
        name: expect.any(String),
      },
      supplier: {
        id: expect.any(String),
        name: expect.any(String),
      },
    })
  })

  it('returns recent movements with product and user details', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createLowStockProduct(admin.accessToken, suffix)

    await request(app)
      .post('/api/v1/inventory/movements')
      .set(authHeader(admin.accessToken))
      .send({
        productId,
        type: 'OUT',
        quantity: 1,
        reason: 'Dashboard exit',
      })
      .expect(201)

    const response = await request(app)
      .get('/api/v1/dashboard/recent-movements?limit=5')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data.length).toBeGreaterThan(0)
    expect(response.body.data.length).toBeLessThanOrEqual(5)

    const movement = response.body.data[0]

    expect(movement).toMatchObject({
      id: expect.any(String),
      type: 'OUT',
      quantity: expect.any(Number),
      previousQuantity: expect.any(Number),
      newQuantity: expect.any(Number),
      reason: 'Dashboard exit',
      createdAt: expect.any(String),
      product: {
        id: productId,
        name: expect.any(String),
        sku: expect.any(String),
      },
      user: {
        id: admin.userId,
        firstName: expect.any(String),
        lastName: expect.any(String),
        email: admin.email,
      },
    })

    expect(movement.user).not.toHaveProperty('passwordHash')
  })

  it('returns 403 for employee on summary and recent-movements', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')

    await request(app)
      .get('/api/v1/dashboard/summary')
      .set(authHeader(employee.accessToken))
      .expect(403)

    await request(app)
      .get('/api/v1/dashboard/recent-movements')
      .set(authHeader(employee.accessToken))
      .expect(403)
  })

  it('allows employee to access low-stock-products', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')
    const suffix = uniqueSuffix()
    await createLowStockProduct(admin.accessToken, suffix)

    const response = await request(app)
      .get('/api/v1/dashboard/low-stock-products')
      .set(authHeader(employee.accessToken))
      .expect(200)

    expect(response.body.data.length).toBeGreaterThan(0)
  })

  it('does not expose dashboard data from another company', async () => {
    const companyA = await registerCompanyAndAdmin(`dash-a-${uniqueSuffix()}`)
    const companyB = await registerCompanyAndAdmin(`dash-b-${uniqueSuffix()}`)
    companyIds.push(companyA.companyId, companyB.companyId)

    const suffix = uniqueSuffix()
    await createLowStockProduct(companyA.accessToken, suffix)

    const summaryB = await request(app)
      .get('/api/v1/dashboard/summary')
      .set(authHeader(companyB.accessToken))
      .expect(200)

    const lowStockB = await request(app)
      .get('/api/v1/dashboard/low-stock-products')
      .set(authHeader(companyB.accessToken))
      .expect(200)

    expect(lowStockB.body.data.some((item: { sku: string }) => item.sku.includes('dash-low'))).toBe(
      false,
    )
    expect(summaryB.body.data.totalProducts).toBe(0)
  })
})

describe('Stock dashboard E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  async function createProduct(
    token: string,
    suffix: string,
    data: {
      name: string
      sku: string
      price: number
      quantity: number
      minimumStock: number
      active?: boolean
    },
  ): Promise<string> {
    const response = await request(app)
      .post('/api/v1/products')
      .set(authHeader(token))
      .send({
        name: data.name,
        sku: data.sku,
        price: data.price,
        quantity: data.quantity,
        minimumStock: data.minimumStock,
        active: data.active ?? true,
      })
      .expect(201)

    return response.body.data.id as string
  }

  it('returns 401 without token', async () => {
    await request(app).get('/api/v1/dashboard/stock').expect(401)
  })

  it('returns stock metrics with recent movements', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()

    const healthyId = await createProduct(admin.accessToken, suffix, {
      name: `Healthy ${suffix}`,
      sku: `healthy-${suffix}`,
      price: 100,
      quantity: 20,
      minimumStock: 5,
    })

    await createProduct(admin.accessToken, suffix, {
      name: `Low ${suffix}`,
      sku: `low-${suffix}`,
      price: 50,
      quantity: 2,
      minimumStock: 5,
    })

    await createProduct(admin.accessToken, suffix, {
      name: `Inactive ${suffix}`,
      sku: `inactive-${suffix}`,
      price: 30,
      quantity: 1,
      minimumStock: 10,
      active: false,
    })

    await request(app)
      .post(`/api/v1/products/${healthyId}/stock-movements`)
      .set(authHeader(admin.accessToken))
      .send({ type: 'IN', quantity: 3, reason: 'Restock' })
      .expect(201)

    await request(app)
      .post(`/api/v1/products/${healthyId}/stock-movements`)
      .set(authHeader(admin.accessToken))
      .send({ type: 'OUT', quantity: 1, reason: 'Sale' })
      .expect(201)

    const response = await request(app)
      .get('/api/v1/dashboard/stock')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data).toMatchObject({
      totalProducts: 3,
      activeProducts: 2,
      inactiveProducts: 1,
      lowStockProducts: 1,
      totalStockQuantity: 25,
      totalInventoryValue: 2330,
    })
    expect(response.body.data.recentMovements).toHaveLength(2)
    expect(response.body.data.recentMovements[0]).toMatchObject({
      id: expect.any(String),
      productId: healthyId,
      productName: expect.stringContaining('Healthy'),
      type: expect.stringMatching(/IN|OUT|ADJUSTMENT/),
      quantity: expect.any(Number),
      previousQuantity: expect.any(Number),
      newQuantity: expect.any(Number),
      userId: admin.userId,
      userEmail: admin.email,
      createdAt: expect.any(String),
    })
    expect(response.body.data.recentMovements.length).toBeLessThanOrEqual(5)
  })

  it('ignores soft-deleted products in metrics', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProduct(admin.accessToken, suffix, {
      name: `Deleted ${suffix}`,
      sku: `deleted-${suffix}`,
      price: 10,
      quantity: 5,
      minimumStock: 2,
    })

    await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set(authHeader(admin.accessToken))
      .expect(204)

    const response = await request(app)
      .get('/api/v1/dashboard/stock')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data.totalProducts).toBe(0)
    expect(response.body.data.totalStockQuantity).toBe(0)
    expect(response.body.data.totalInventoryValue).toBe(0)
  })

  it('returns 403 for USER role', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'USER')

    await request(app)
      .get('/api/v1/dashboard/stock')
      .set(authHeader(employee.accessToken))
      .expect(403)
  })

  it('allows MANAGER role to access stock dashboard', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const manager = await createUserWithRole(admin.accessToken, 'MANAGER')

    await request(app)
      .get('/api/v1/dashboard/stock')
      .set(authHeader(manager.accessToken))
      .expect(200)
  })

  it('returns at most 5 recent movements ordered by newest first', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createProduct(admin.accessToken, suffix, {
      name: `Movement ${suffix}`,
      sku: `movement-${suffix}`,
      price: 10,
      quantity: 20,
      minimumStock: 2,
    })

    for (let index = 0; index < 6; index += 1) {
      await request(app)
        .post(`/api/v1/products/${productId}/stock-movements`)
        .set(authHeader(admin.accessToken))
        .send({ type: 'IN', quantity: 1, reason: `Batch ${index}` })
        .expect(201)
    }

    const response = await request(app)
      .get('/api/v1/dashboard/stock')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.data.recentMovements).toHaveLength(5)

    const timestamps = response.body.data.recentMovements.map((item: { createdAt: string }) =>
      new Date(item.createdAt).getTime(),
    )

    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a))
  })
})
