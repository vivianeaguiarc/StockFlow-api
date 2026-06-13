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

describe('Categories E2E', () => {
  const companyIds: string[] = []

  afterEach(async () => {
    await cleanupCompanies(companyIds)
    companyIds.length = 0
  })

  it('returns 401 when listing categories without token', async () => {
    await request(app).get('/api/categories').expect(401)
  })

  it('supports create, list, get, update and soft delete', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()
    const name = `Category ${suffix}`

    const created = await request(app)
      .post('/api/categories')
      .set(authHeader(admin.accessToken))
      .send({ name, description: 'Test category' })
      .expect(201)

    const categoryId = created.body.id as string

    const list = await request(app)
      .get('/api/categories')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(list.body.data.some((item: { id: string }) => item.id === categoryId)).toBe(true)

    const fetched = await request(app)
      .get(`/api/categories/${categoryId}`)
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(fetched.body.name).toBe(name)

    const updated = await request(app)
      .patch(`/api/categories/${categoryId}`)
      .set(authHeader(admin.accessToken))
      .send({ name: `${name} Updated` })
      .expect(200)

    expect(updated.body.name).toBe(`${name} Updated`)

    await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set(authHeader(admin.accessToken))
      .expect(204)

    await request(app)
      .get(`/api/categories/${categoryId}`)
      .set(authHeader(admin.accessToken))
      .expect(404)
  })

  it('returns 403 when manager tries to delete category', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const manager = await createUserWithRole(admin.accessToken, 'MANAGER')

    const created = await request(app)
      .post('/api/categories')
      .set(authHeader(manager.accessToken))
      .send({ name: `Manager Category ${uniqueSuffix()}` })
      .expect(201)

    await request(app)
      .delete(`/api/categories/${created.body.id as string}`)
      .set(authHeader(manager.accessToken))
      .expect(403)
  })

  it('does not expose categories from another company', async () => {
    const companyA = await registerCompanyAndAdmin(`cat-a-${uniqueSuffix()}`)
    const companyB = await registerCompanyAndAdmin(`cat-b-${uniqueSuffix()}`)
    companyIds.push(companyA.companyId, companyB.companyId)

    const created = await request(app)
      .post('/api/categories')
      .set(authHeader(companyA.accessToken))
      .send({ name: `Private Category ${uniqueSuffix()}` })
      .expect(201)

    const categoryId = created.body.id as string

    await request(app)
      .get(`/api/categories/${categoryId}`)
      .set(authHeader(companyB.accessToken))
      .expect(404)

    const listB = await request(app)
      .get('/api/categories')
      .set(authHeader(companyB.accessToken))
      .expect(200)

    expect(listB.body.data.some((item: { id: string }) => item.id === categoryId)).toBe(false)
  })

  it('supports pagination, sorting and filters on list', async () => {
    const admin = await registerCompanyAndAdmin()
    companyIds.push(admin.companyId)

    const suffix = uniqueSuffix()

    await request(app)
      .post('/api/categories')
      .set(authHeader(admin.accessToken))
      .send({ name: `Eletrônicos ${suffix}`, description: 'Eletronicos' })
      .expect(201)

    await request(app)
      .post('/api/categories')
      .set(authHeader(admin.accessToken))
      .send({ name: `Móveis ${suffix}` })
      .expect(201)

    const search = await request(app)
      .get('/api/categories?search=eletr')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(search.body.data.length).toBeGreaterThan(0)
    expect(
      search.body.data.every((item: { name: string }) => item.name.toLowerCase().includes('eletr')),
    ).toBe(true)

    const paginated = await request(app)
      .get('/api/categories?page=1&pageSize=1&sortBy=name&sortOrder=asc')
      .set(authHeader(admin.accessToken))
      .expect(200)

    expect(paginated.body.data).toHaveLength(1)
    expect(paginated.body.meta).toMatchObject({
      page: 1,
      pageSize: 1,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number),
    })
  })
})
