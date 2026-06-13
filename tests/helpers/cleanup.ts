import { prisma } from '../../src/shared/database/prisma.js'

export async function cleanupCompany(companyId: string): Promise<void> {
  await prisma.$transaction([
    prisma.auditLog.deleteMany({ where: { companyId } }),
    prisma.inventoryMovement.deleteMany({ where: { companyId } }),
    prisma.product.deleteMany({ where: { companyId } }),
    prisma.category.deleteMany({ where: { companyId } }),
    prisma.supplier.deleteMany({ where: { companyId } }),
    prisma.user.deleteMany({ where: { companyId } }),
    prisma.company.delete({ where: { id: companyId } }),
  ])
}

export async function cleanupCompanies(companyIds: string[]): Promise<void> {
  await Promise.all(companyIds.map((companyId) => cleanupCompany(companyId)))
}
