# Swagger / OpenAPI

Interactive API documentation powered by **OpenAPI 3.0**.

| Resource     | Path                     |
| ------------ | ------------------------ |
| Swagger UI   | `/api/docs`              |
| OpenAPI JSON | `/api/docs/openapi.json` |

## Structure

- `swagger.ts` — OpenAPI definition, servers, tags, registration
- `swagger-components.ts` — reusable schemas, responses, parameters, `BearerAuth`
- `swagger-paths.ts` — route documentation
- `swagger-examples.ts` — safe documentation examples (no real secrets)

## Authentication in Swagger UI

1. Call `POST /api/v1/auth/login`
2. Copy `accessToken` from the response
3. Click **Authorize** and paste the token (without the `Bearer` prefix)
