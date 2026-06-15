import 'dotenv/config'

import { PrismaClient, UserRole, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const BCRYPT_SALT_ROUNDS = 12

const SEED_COMPANY = {
  name: 'StockFlow Demo Company',
  document: '00000000000100',
  email: 'admin@stockflow.com',
  phone: '+5532999999999',
} as const

const SEED_USER = {
  firstName: 'Admin',
  lastName: 'StockFlow',
  email: 'admin@stockflow.com',
  password: 'Admin@123456',
} as const

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(SEED_USER.password, BCRYPT_SALT_ROUNDS)

  const company = await prisma.company.upsert({
    where: { document: SEED_COMPANY.document },
    update: {
      name: SEED_COMPANY.name,
      email: SEED_COMPANY.email,
      phone: SEED_COMPANY.phone,
      active: true,
      deletedAt: null,
    },
    create: {
      name: SEED_COMPANY.name,
      document: SEED_COMPANY.document,
      email: SEED_COMPANY.email,
      phone: SEED_COMPANY.phone,
      active: true,
    },
  })

  const user = await prisma.user.upsert({
    where: { email: SEED_USER.email },
    update: {
      firstName: SEED_USER.firstName,
      lastName: SEED_USER.lastName,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      companyId: company.id,
      deletedAt: null,
    },
    create: {
      firstName: SEED_USER.firstName,
      lastName: SEED_USER.lastName,
      email: SEED_USER.email,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      companyId: company.id,
    },
  })

  console.warn('Seed completed successfully', {
    companyId: company.id,
    companyDocument: company.document,
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
  })
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
