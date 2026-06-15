import 'dotenv/config'

import { PrismaClient, type Company, type Product, type User } from '@prisma/client'
import bcrypt from 'bcryptjs'

import {
  DEMO_COMPANIES,
  DEMO_MOVEMENT_REASON_PREFIX,
  DEMO_PASSWORD,
  DEMO_PRODUCTS,
  DEMO_STOCK_MOVEMENTS,
  DEMO_USERS,
} from './seed-data.js'

const prisma = new PrismaClient()

const BCRYPT_SALT_ROUNDS = 12

type SeedSummary = {
  companies: Record<'stockflow' | 'techSupplies', Company>
  users: User[]
  products: Product[]
  movementsCreated: number
}

async function upsertCompany(key: 'stockflow' | 'techSupplies'): Promise<Company> {
  const data = DEMO_COMPANIES[key]

  return prisma.company.upsert({
    where: { document: data.document },
    update: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      active: true,
      deletedAt: null,
    },
    create: {
      name: data.name,
      document: data.document,
      email: data.email,
      phone: data.phone,
      active: true,
    },
  })
}

async function upsertUsers(
  companies: Record<'stockflow' | 'techSupplies', Company>,
  passwordHash: string,
): Promise<User[]> {
  const users: User[] = []

  for (const demoUser of DEMO_USERS) {
    const companyId = companies[demoUser.companyKey].id

    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        passwordHash,
        role: demoUser.role,
        status: 'ACTIVE',
        companyId,
        deletedAt: null,
      },
      create: {
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        email: demoUser.email,
        passwordHash,
        role: demoUser.role,
        status: 'ACTIVE',
        companyId,
      },
    })

    users.push(user)
  }

  return users
}

async function upsertProducts(
  companies: Record<'stockflow' | 'techSupplies', Company>,
): Promise<Product[]> {
  const products: Product[] = []

  for (const demoProduct of DEMO_PRODUCTS) {
    const companyId = companies[demoProduct.companyKey].id

    const product = await prisma.product.upsert({
      where: {
        companyId_sku: {
          companyId,
          sku: demoProduct.sku,
        },
      },
      update: {
        name: demoProduct.name,
        description: demoProduct.description,
        price: demoProduct.price,
        quantity: demoProduct.quantity,
        minimumStock: demoProduct.minimumStock,
        active: demoProduct.active,
        deletedAt: null,
      },
      create: {
        companyId,
        name: demoProduct.name,
        description: demoProduct.description,
        sku: demoProduct.sku,
        price: demoProduct.price,
        quantity: demoProduct.quantity,
        minimumStock: demoProduct.minimumStock,
        active: demoProduct.active,
      },
    })

    products.push(product)
  }

  return products
}

async function seedMovements(
  companies: Record<'stockflow' | 'techSupplies', Company>,
  products: Product[],
  users: User[],
): Promise<number> {
  const existingCount = await prisma.stockMovement.count({
    where: {
      reason: {
        startsWith: DEMO_MOVEMENT_REASON_PREFIX,
      },
    },
  })

  if (existingCount > 0) {
    return 0
  }

  const adminUser =
    users.find((user) => user.email === 'admin@stockflow.dev') ??
    users.find((user) => user.role === 'ADMIN')

  if (!adminUser) {
    throw new Error('Demo admin user not found for stock movement seed')
  }

  let created = 0

  for (const movement of DEMO_STOCK_MOVEMENTS) {
    const companyId = companies[movement.companyKey].id
    const product = products.find(
      (item) => item.companyId === companyId && item.sku === movement.productSku,
    )

    if (!product) {
      throw new Error(`Demo product not found for movement: ${movement.productSku}`)
    }

    await prisma.stockMovement.create({
      data: {
        companyId,
        productId: product.id,
        userId: adminUser.id,
        type: movement.type,
        quantity: movement.quantity,
        previousQuantity: movement.previousQuantity,
        newQuantity: movement.newQuantity,
        reason: `${DEMO_MOVEMENT_REASON_PREFIX} ${movement.reason}`,
        createdAt: movement.createdAt,
      },
    })

    created += 1
  }

  return created
}

export async function seedDatabase(): Promise<SeedSummary> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_SALT_ROUNDS)

  const companies = {
    stockflow: await upsertCompany('stockflow'),
    techSupplies: await upsertCompany('techSupplies'),
  }

  const users = await upsertUsers(companies, passwordHash)
  const products = await upsertProducts(companies)
  const movementsCreated = await seedMovements(companies, products, users)

  return {
    companies,
    users,
    products,
    movementsCreated,
  }
}

async function main(): Promise<void> {
  const summary = await seedDatabase()

  console.warn('Seed completed successfully', {
    companies: Object.values(summary.companies).map((company) => ({
      id: company.id,
      name: company.name,
      document: company.document,
    })),
    users: summary.users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    })),
    products: summary.products.length,
    movementsCreated: summary.movementsCreated,
    demoPassword: DEMO_PASSWORD,
  })
}

const isDirectExecution = process.argv[1]?.replace(/\\/g, '/').endsWith('prisma/seed.ts')

if (isDirectExecution) {
  main()
    .catch((error: unknown) => {
      console.error('Seed failed:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export {
  DEMO_COMPANIES,
  DEMO_MOVEMENT_REASON_PREFIX,
  DEMO_PASSWORD,
  DEMO_PRODUCTS,
  DEMO_STOCKFLOW_PRODUCT_SKUS,
  DEMO_USER_EMAILS,
  DEMO_USERS,
} from './seed-data.js'
