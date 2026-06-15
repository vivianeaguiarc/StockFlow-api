import { describe, expect, it } from 'vitest'

import { createProductSchema } from '../../src/modules/products/dtos/create-product.dto.js'
import { updateProductSchema } from '../../src/modules/products/dtos/update-product.dto.js'

describe('createProductSchema', () => {
  it('accepts valid product payload', () => {
    const result = createProductSchema.safeParse({
      name: 'Notebook',
      sku: 'NB-001',
      price: 29.9,
      quantity: 5,
      minimumStock: 2,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toMatchObject({
        name: 'Notebook',
        sku: 'NB-001',
        price: 29.9,
        quantity: 5,
        minimumStock: 2,
        active: true,
      })
    }
  })

  it('rejects zero or negative price', () => {
    expect(createProductSchema.safeParse({ name: 'A', sku: 'B', price: 0 }).success).toBe(false)
    expect(createProductSchema.safeParse({ name: 'A', sku: 'B', price: -1 }).success).toBe(false)
  })

  it('rejects negative quantity', () => {
    expect(
      createProductSchema.safeParse({ name: 'A', sku: 'B', price: 10, quantity: -1 }).success,
    ).toBe(false)
  })
})

describe('updateProductSchema', () => {
  it('rejects empty update payload', () => {
    expect(updateProductSchema.safeParse({}).success).toBe(false)
  })

  it('accepts partial updates with positive price', () => {
    const result = updateProductSchema.safeParse({ price: 19.99, active: false })
    expect(result.success).toBe(true)
  })
})
