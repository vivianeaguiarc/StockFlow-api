import { UserRole } from '@prisma/client'

export const DEMO_PASSWORD = 'Demo@123456'

export const DEMO_COMPANIES = {
  stockflow: {
    name: 'StockFlow Demo LTDA',
    document: '12345678000190',
    email: 'contato@stockflow.dev',
    phone: '+5511999990001',
  },
  techSupplies: {
    name: 'Tech Supplies Demo',
    document: '98765432000110',
    email: 'contato@techsupplies.dev',
    phone: '+5511999990002',
  },
} as const

export const DEMO_USERS = [
  {
    email: 'admin@stockflow.dev',
    firstName: 'Demo',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    companyKey: 'stockflow' as const,
  },
  {
    email: 'manager@stockflow.dev',
    firstName: 'Demo',
    lastName: 'Manager',
    role: UserRole.MANAGER,
    companyKey: 'stockflow' as const,
  },
  {
    email: 'user@stockflow.dev',
    firstName: 'Demo',
    lastName: 'User',
    role: UserRole.USER,
    companyKey: 'stockflow' as const,
  },
] as const

export type DemoProductSeed = {
  sku: string
  name: string
  description: string
  price: number
  quantity: number
  minimumStock: number
  active: boolean
  companyKey: 'stockflow' | 'techSupplies'
}

export const DEMO_PRODUCTS: DemoProductSeed[] = [
  {
    sku: 'DEMO-NOTE-DELL',
    name: 'Notebook Dell Inspiron',
    description: 'Notebook 15 polegadas para uso corporativo',
    price: 4299.9,
    quantity: 25,
    minimumStock: 5,
    active: true,
    companyKey: 'stockflow',
  },
  {
    sku: 'DEMO-MOUSE-LOG',
    name: 'Mouse Logitech',
    description: 'Mouse sem fio compacto',
    price: 189.9,
    quantity: 2,
    minimumStock: 10,
    active: true,
    companyKey: 'stockflow',
  },
  {
    sku: 'DEMO-KBD-MECH',
    name: 'Teclado Mecânico',
    description: 'Teclado mecanico ABNT2 RGB',
    price: 349.9,
    quantity: 18,
    minimumStock: 5,
    active: true,
    companyKey: 'stockflow',
  },
  {
    sku: 'DEMO-MON-LG',
    name: 'Monitor LG',
    description: 'Monitor 24 polegadas Full HD',
    price: 899.9,
    quantity: 1,
    minimumStock: 8,
    active: true,
    companyKey: 'stockflow',
  },
  {
    sku: 'DEMO-CAB-HDMI',
    name: 'Cabo HDMI',
    description: 'Cabo HDMI 2.0 de 2 metros',
    price: 39.9,
    quantity: 100,
    minimumStock: 20,
    active: false,
    companyKey: 'stockflow',
  },
  {
    sku: 'DEMO-TECH-SSD',
    name: 'SSD NVMe 1TB',
    description: 'Unidade de estado solido para notebooks',
    price: 499.9,
    quantity: 12,
    minimumStock: 4,
    active: true,
    companyKey: 'techSupplies',
  },
  {
    sku: 'DEMO-TECH-RAM',
    name: 'Memoria RAM 16GB',
    description: 'Modulo DDR4 3200MHz',
    price: 279.9,
    quantity: 1,
    minimumStock: 6,
    active: true,
    companyKey: 'techSupplies',
  },
]

export const DEMO_USER_EMAILS = DEMO_USERS.map((user) => user.email)

export const DEMO_STOCKFLOW_PRODUCT_SKUS = DEMO_PRODUCTS.filter(
  (product) => product.companyKey === 'stockflow',
).map((product) => product.sku)

export const DEMO_MOVEMENT_REASON_PREFIX = '[seed-demo]'

export type DemoMovementSeed = {
  productSku: string
  companyKey: 'stockflow' | 'techSupplies'
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string
  createdAt: Date
}

export const DEMO_STOCK_MOVEMENTS: DemoMovementSeed[] = [
  {
    productSku: 'DEMO-NOTE-DELL',
    companyKey: 'stockflow',
    type: 'IN',
    quantity: 30,
    previousQuantity: 0,
    newQuantity: 30,
    reason: 'Entrada de compra do fornecedor Dell',
    createdAt: new Date('2026-06-01T10:00:00.000Z'),
  },
  {
    productSku: 'DEMO-NOTE-DELL',
    companyKey: 'stockflow',
    type: 'OUT',
    quantity: 5,
    previousQuantity: 30,
    newQuantity: 25,
    reason: 'Saida para pedido corporativo #1042',
    createdAt: new Date('2026-06-03T14:30:00.000Z'),
  },
  {
    productSku: 'DEMO-MOUSE-LOG',
    companyKey: 'stockflow',
    type: 'IN',
    quantity: 20,
    previousQuantity: 0,
    newQuantity: 20,
    reason: 'Reposicao de estoque Logitech',
    createdAt: new Date('2026-06-02T09:15:00.000Z'),
  },
  {
    productSku: 'DEMO-MOUSE-LOG',
    companyKey: 'stockflow',
    type: 'OUT',
    quantity: 18,
    previousQuantity: 20,
    newQuantity: 2,
    reason: 'Saida para vendas do balcao',
    createdAt: new Date('2026-06-05T16:45:00.000Z'),
  },
  {
    productSku: 'DEMO-KBD-MECH',
    companyKey: 'stockflow',
    type: 'IN',
    quantity: 15,
    previousQuantity: 3,
    newQuantity: 18,
    reason: 'Entrada de lote promocional',
    createdAt: new Date('2026-06-04T11:20:00.000Z'),
  },
  {
    productSku: 'DEMO-MON-LG',
    companyKey: 'stockflow',
    type: 'OUT',
    quantity: 4,
    previousQuantity: 5,
    newQuantity: 1,
    reason: 'Saida para projeto interno de TI',
    createdAt: new Date('2026-06-06T08:00:00.000Z'),
  },
  {
    productSku: 'DEMO-MON-LG',
    companyKey: 'stockflow',
    type: 'ADJUSTMENT',
    quantity: 1,
    previousQuantity: 1,
    newQuantity: 1,
    reason: 'Ajuste apos inventario fisico',
    createdAt: new Date('2026-06-07T13:10:00.000Z'),
  },
  {
    productSku: 'DEMO-CAB-HDMI',
    companyKey: 'stockflow',
    type: 'IN',
    quantity: 100,
    previousQuantity: 0,
    newQuantity: 100,
    reason: 'Entrada inicial de cabos HDMI',
    createdAt: new Date('2026-06-01T15:00:00.000Z'),
  },
  {
    productSku: 'DEMO-TECH-SSD',
    companyKey: 'techSupplies',
    type: 'IN',
    quantity: 12,
    previousQuantity: 0,
    newQuantity: 12,
    reason: 'Entrada de SSDs para catalogo demo',
    createdAt: new Date('2026-06-02T12:00:00.000Z'),
  },
  {
    productSku: 'DEMO-TECH-RAM',
    companyKey: 'techSupplies',
    type: 'OUT',
    quantity: 5,
    previousQuantity: 6,
    newQuantity: 1,
    reason: 'Saida para pedido B2B demo',
    createdAt: new Date('2026-06-04T17:30:00.000Z'),
  },
]
