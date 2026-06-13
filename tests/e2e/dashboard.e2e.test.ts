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
    .post('/api/categories')
    .set(authHeader(token))
    .send({ name: `Dash Category ${suffix}` })
    .expect(201)

  const supplier = await request(app)
    .post('/api/suppliers')
    .set(authHeader(token))
    .send({
      corporateName: `Dash Corp ${suffix}`,
      tradeName: `Dash Trade ${suffix}`,
      document: `dash-supplier-${suffix}`,
    })
    .expect(201)

  const product = await request(app)
    .post('/api/products')
    .set(authHeader(token))
    .send({
      categoryId: category.body.id as string,
      supplierId: supplier.body.id as string,
      name: `Low Stock Product ${suffix}`,
      sku: `dash-low-${suffix}`,
      costPrice: 10,
      salePrice: 20,
      quantity: 2,
      minimumStock: 5,
    })
    .expect(201)

  return product.body.id as string
}

describe('Dashboard E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('returns 401 when accessing dashboard without token', async () => {
    await request(app).get('/api/dashboard/summary').expect(401)
  })

  it('returns summary metrics for admin', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    await createLowStockProduct(admin.accessToken, suffix)

    await request(app)
      .post('/api/inventory/movements')
      .set(authHeader(admin.accessToken))
      .send({
        productId: await createLowStockProduct(admin.accessToken, `${suffix}-move`),
        type: 'ENTRY',
        quantity: 1,
        reason: 'Dashboard entry',
      })
      .expect(201)

    const summary = await request(app)
      .get('/api/dashboard/summary')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(summary.body).toMatchObject({
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

    expect(summary.body.totalUsers).toBeGreaterThanOrEqual(1)
    expect(summary.body.lowStockProducts).toBeGreaterThanOrEqual(2)
    expect(summary.body.entriesToday).toBeGreaterThanOrEqual(1)
  })

  it('returns low stock products with category and supplier', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const productId = await createLowStockProduct(admin.accessToken, suffix)

    const response = await request(app)
      .get('/api/dashboard/low-stock-products')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.length).toBeGreaterThan(0)

    const product = response.body.find((item: { id: string }) => item.id === productId)

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
      .post('/api/inventory/movements')
      .set(authHeader(admin.accessToken))
      .send({
        productId,
        type: 'EXIT',
        quantity: 1,
        reason: 'Dashboard exit',
      })
      .expect(201)

    const response = await request(app)
      .get('/api/dashboard/recent-movements?limit=5')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(response.body.length).toBeGreaterThan(0)
    expect(response.body.length).toBeLessThanOrEqual(5)

    const movement = response.body[0]

    expect(movement).toMatchObject({
      id: expect.any(String),
      type: 'EXIT',
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

    const employee = await createUserWithRole(admin.accessToken, 'EMPLOYEE')

    await request(app)
      .get('/api/dashboard/summary')
      .set(authHeader(employee.accessToken))
      .expect(403)

    await request(app)
      .get('/api/dashboard/recent-movements')
      .set(authHeader(employee.accessToken))
      .expect(403)
  })

  it('allows employee to access low-stock-products', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const employee = await createUserWithRole(admin.accessToken, 'EMPLOYEE')
    const suffix = uniqueSuffix()
    await createLowStockProduct(admin.accessToken, suffix)

    const response = await request(app)
      .get('/api/dashboard/low-stock-products')
      .set(authHeader(employee.accessToken))
      .expect(200)

    expect(response.body.length).toBeGreaterThan(0)
  })

  it('does not expose dashboard data from another company', async () => {
    const companyA = await registerCompanyAndAdmin(`dash-a-${uniqueSuffix()}`)
    const companyB = await registerCompanyAndAdmin(`dash-b-${uniqueSuffix()}`)
    companyIds.push(companyA.companyId, companyB.companyId)

    const suffix = uniqueSuffix()
    await createLowStockProduct(companyA.accessToken, suffix)

    const summaryB = await request(app)
      .get('/api/dashboard/summary')
      .set(authHeader(companyB.accessToken))
      .expect(200)

    const lowStockB = await request(app)
      .get('/api/dashboard/low-stock-products')
      .set(authHeader(companyB.accessToken))
      .expect(200)

    expect(lowStockB.body.some((item: { sku: string }) => item.sku.includes('dash-low'))).toBe(
      false,
    )
    expect(summaryB.body.totalProducts).toBe(0)
  })
})
