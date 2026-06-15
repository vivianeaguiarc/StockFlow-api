import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../../src/app.js'
import { getSwaggerSpec } from '../../src/docs/swagger.js'

const app = createApp()

describe('Swagger / OpenAPI documentation', () => {
  it('GET /api/docs serves Swagger UI (200)', async () => {
    const response = await request(app).get('/api/docs/').expect(200)

    expect(response.text).toContain('swagger')
  })

  it('GET /api/docs/openapi.json returns OpenAPI 3.0 spec', async () => {
    const response = await request(app).get('/api/docs/openapi.json').expect(200)

    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.body.openapi).toBe('3.0.0')
    expect(response.body.info.title).toBe('StockFlow API')
    expect(response.body.components.securitySchemes.BearerAuth).toMatchObject({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    expect(response.body.paths['/api/v1/auth/login']).toBeDefined()
    expect(response.body.paths['/api/v1/users']).toBeDefined()
    expect(response.body.paths['/api/v1/health']).toBeDefined()
    expect(response.body.paths['/api/v1/ready']).toBeDefined()
    expect(response.headers['x-request-id']).toBeDefined()
  })

  it('getSwaggerSpec exposes required schemas and responses', () => {
    const spec = getSwaggerSpec()

    const schemas = spec.components?.schemas ?? {}
    const responses = spec.components?.responses ?? {}

    expect(schemas.User).toBeDefined()
    expect(schemas.CreateUserRequest).toBeDefined()
    expect(schemas.LoginResponse).toBeDefined()
    expect(schemas.ReadyResponse).toBeDefined()
    expect(schemas.PaginatedUsersResponse).toBeDefined()
    expect(responses.BadRequest).toBeDefined()
    expect(responses.Forbidden).toBeDefined()
    expect(responses.TooManyRequests).toBeDefined()
    expect(responses.NoContent).toBeDefined()
  })

  it('does not expose passwordHash in User response schema', () => {
    const spec = getSwaggerSpec()
    const userSchema = spec.components?.schemas?.User as { properties?: Record<string, unknown> }

    expect(userSchema.properties).toBeDefined()
    expect(userSchema.properties).not.toHaveProperty('password')
    expect(userSchema.properties).not.toHaveProperty('passwordHash')
  })
})
