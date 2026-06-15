import { describe, expect, it } from 'vitest'

import {
  DEMO_PASSWORD,
  DEMO_STOCKFLOW_PRODUCT_SKUS,
  DEMO_USER_EMAILS,
  seedDatabase,
} from '../../prisma/seed.js'
import { prisma } from '../../src/shared/database/prisma.js'

describe('database seed', () => {
  it('executes without error', async () => {
    const summary = await seedDatabase()

    expect(summary.companies.stockflow.name).toBe('StockFlow Demo LTDA')
    expect(summary.companies.techSupplies.name).toBe('Tech Supplies Demo')
    expect(summary.users.length).toBe(3)
    expect(summary.products.length).toBeGreaterThanOrEqual(5)
  })

  it('creates demo users with expected roles', async () => {
    await seedDatabase()

    const admin = await prisma.user.findUnique({ where: { email: 'admin@stockflow.dev' } })
    const manager = await prisma.user.findUnique({ where: { email: 'manager@stockflow.dev' } })
    const user = await prisma.user.findUnique({ where: { email: 'user@stockflow.dev' } })

    expect(admin).toMatchObject({ role: 'ADMIN', status: 'ACTIVE' })
    expect(manager).toMatchObject({ role: 'MANAGER', status: 'ACTIVE' })
    expect(user).toMatchObject({ role: 'USER', status: 'ACTIVE' })
    expect(admin?.companyId).toBe(manager?.companyId)
    expect(admin?.companyId).toBe(user?.companyId)
  })

  it('creates demo products for StockFlow Demo LTDA', async () => {
    await seedDatabase()

    const company = await prisma.company.findUnique({
      where: { document: '12345678000190' },
    })

    expect(company).not.toBeNull()

    const products = await prisma.product.findMany({
      where: {
        companyId: company!.id,
        sku: { in: [...DEMO_STOCKFLOW_PRODUCT_SKUS] },
        deletedAt: null,
      },
    })

    expect(products).toHaveLength(DEMO_STOCKFLOW_PRODUCT_SKUS.length)
    expect(products.some((product) => product.name === 'Notebook Dell Inspiron')).toBe(true)
    expect(products.some((product) => product.name === 'Mouse Logitech')).toBe(true)
    expect(products.some((product) => product.active === false)).toBe(true)
    expect(products.some((product) => product.quantity <= product.minimumStock)).toBe(true)
  })

  it('remains idempotent when executed multiple times', async () => {
    await seedDatabase()
    await seedDatabase()

    const users = await prisma.user.count({
      where: { email: { in: [...DEMO_USER_EMAILS] } },
    })

    const stockflowCompany = await prisma.company.findUnique({
      where: { document: '12345678000190' },
    })

    const products = await prisma.product.count({
      where: {
        companyId: stockflowCompany!.id,
        sku: { in: [...DEMO_STOCKFLOW_PRODUCT_SKUS] },
      },
    })

    const seedMovements = await prisma.stockMovement.count({
      where: { reason: { startsWith: '[seed-demo]' } },
    })

    expect(users).toBe(DEMO_USER_EMAILS.length)
    expect(products).toBe(DEMO_STOCKFLOW_PRODUCT_SKUS.length)
    expect(seedMovements).toBeGreaterThan(0)
  })

  it('documents demo password constant for README parity', () => {
    expect(DEMO_PASSWORD).toBe('Demo@123456')
  })
})
