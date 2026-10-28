import { AuditAction, type StockMovement } from '@prisma/client'
import { afterEach, describe, expect, it } from 'vitest'

import { InventoryService } from '../../src/modules/inventory/services/InventoryService.js'
import { StockMovementsService } from '../../src/modules/products/stock-movements/services/StockMovementsService.js'
import { prisma } from '../../src/shared/database/prisma.js'
import { cleanupCompanies } from '../helpers/cleanup.js'
import { uniqueSuffix } from '../helpers/test-data.js'

const CONCURRENT_MOVEMENTS = 12

async function createCompanyWithProduct(
  initialQuantity: number,
): Promise<{ companyId: string; userId: string; productId: string }> {
  const suffix = uniqueSuffix()

  const company = await prisma.company.create({
    data: {
      name: `Concurrency Co ${suffix}`,
      email: `concurrency-${suffix}@test.com`,
    },
  })

  const user = await prisma.user.create({
    data: {
      companyId: company.id,
      firstName: 'Concurrency',
      lastName: 'Tester',
      email: `concurrency-user-${suffix}@test.com`,
      passwordHash: 'not-a-real-hash',
      role: 'ADMIN',
    },
  })

  const product = await prisma.product.create({
    data: {
      companyId: company.id,
      name: `Concurrency Product ${suffix}`,
      sku: `concurrency-${suffix}`,
      price: 10,
      quantity: initialQuantity,
    },
  })

  return { companyId: company.id, userId: user.id, productId: product.id }
}

/**
 * Walks the movements starting at `initialQuantity`, following previous -> new.
 * Fails if any link is missing or ambiguous, which happens when two movements
 * were computed from the same stale quantity (lost update).
 */
function walkMovementChain(movements: StockMovement[], initialQuantity: number): number {
  let current = initialQuantity

  for (let step = 0; step < movements.length; step++) {
    const next = movements.filter((movement) => movement.previousQuantity === current)

    expect(next, `movements starting at quantity ${current}`).toHaveLength(1)
    current = next[0]!.newQuantity
  }

  return current
}

describe('stock movements under concurrency', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('serializes concurrent IN movements from both services without lost updates', async () => {
    const initialQuantity = 100
    const { companyId, userId, productId } = await createCompanyWithProduct(initialQuantity)
    companyIds.push(companyId)

    const stockMovementsService = new StockMovementsService()
    const inventoryService = new InventoryService()

    // Distinct quantities make the previous -> new chain unambiguous.
    const quantities = Array.from({ length: CONCURRENT_MOVEMENTS }, (_, index) => index + 1)

    const results = await Promise.all(
      quantities.map((quantity, index) =>
        index % 2 === 0
          ? stockMovementsService.create(companyId, userId, productId, { type: 'IN', quantity })
          : inventoryService.createMovement(companyId, userId, { productId, type: 'IN', quantity }),
      ),
    )

    const expectedFinal = initialQuantity + quantities.reduce((sum, quantity) => sum + quantity, 0)

    for (const result of results) {
      expect(result.newQuantity).toBe(result.previousQuantity + result.quantity)
    }

    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } })
    expect(product.quantity).toBe(expectedFinal)

    const movements = await prisma.stockMovement.findMany({ where: { productId } })
    expect(movements).toHaveLength(CONCURRENT_MOVEMENTS)
    expect(walkMovementChain(movements, initialQuantity)).toBe(expectedFinal)

    const auditLogs = await prisma.auditLog.findMany({
      where: { companyId, entity: 'StockMovement' },
    })
    expect(auditLogs).toHaveLength(CONCURRENT_MOVEMENTS)

    const movementsById = new Map(movements.map((movement) => [movement.id, movement]))
    for (const log of auditLogs) {
      const movement = movementsById.get(log.entityId)
      expect(movement).toBeDefined()
      expect(log.oldValue).toMatchObject({ quantity: movement!.previousQuantity })
      expect(log.newValue).toMatchObject({ newQuantity: movement!.newQuantity })
    }

    expect(new Set(auditLogs.map((log) => log.action))).toEqual(
      new Set([AuditAction.CREATE_STOCK_MOVEMENT, AuditAction.STOCK_ENTRY]),
    )
  })

  it('never lets concurrent OUT movements drive stock negative', async () => {
    const initialQuantity = 5
    const { companyId, userId, productId } = await createCompanyWithProduct(initialQuantity)
    companyIds.push(companyId)

    const service = new StockMovementsService()

    const results = await Promise.allSettled(
      Array.from({ length: CONCURRENT_MOVEMENTS }, () =>
        service.create(companyId, userId, productId, { type: 'OUT', quantity: 1 }),
      ),
    )

    const fulfilled = results.filter((result) => result.status === 'fulfilled')
    const rejected = results.filter((result) => result.status === 'rejected')

    expect(fulfilled).toHaveLength(initialQuantity)
    expect(rejected).toHaveLength(CONCURRENT_MOVEMENTS - initialQuantity)
    for (const result of rejected) {
      expect(result.reason).toMatchObject({ message: 'Insufficient stock', statusCode: 409 })
    }

    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } })
    expect(product.quantity).toBe(0)

    const movements = await prisma.stockMovement.findMany({ where: { productId } })
    expect(movements).toHaveLength(initialQuantity)
    expect(walkMovementChain(movements, initialQuantity)).toBe(0)
  })
})
