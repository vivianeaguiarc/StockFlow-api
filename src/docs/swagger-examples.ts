/** Safe, documentation-only examples — never use real secrets or production data. */

export const EXAMPLE_UUID = '550e8400-e29b-41d4-a716-446655440000'
export const EXAMPLE_COMPANY_ID = '660e8400-e29b-41d4-a716-446655440001'

export const EXAMPLE_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJjb21wYW55SWQiOiI2NjBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MTg0MDAwMDAsImV4cCI6MTcxODQwMDkwMH0.example-signature'

export const EXAMPLE_REFRESH_TOKEN = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890.example-refresh-token'

export const loginRequestExample = {
  email: 'admin@stockflow.dev',
  password: 'Demo@123456',
}

export const loginResponseDataExample = {
  accessToken: EXAMPLE_ACCESS_TOKEN,
  refreshToken: EXAMPLE_REFRESH_TOKEN,
  user: {
    id: EXAMPLE_UUID,
    companyId: EXAMPLE_COMPANY_ID,
    firstName: 'Admin',
    lastName: 'StockFlow',
    email: 'admin@stockflow.dev',
    role: 'ADMIN',
  },
}

export const loginResponseExample = {
  success: true,
  message: 'Login successful',
  data: loginResponseDataExample,
}

export const refreshTokenRequestExample = {
  refreshToken: EXAMPLE_REFRESH_TOKEN,
}

export const refreshTokenResponseExample = {
  success: true,
  message: 'Token refreshed successfully',
  data: {
    accessToken: EXAMPLE_ACCESS_TOKEN,
    refreshToken: 'b2c3d4e5-f6a7-8901-bcde-f12345678901.example-refresh-token',
  },
}

export const createUserRequestExample = {
  firstName: 'Maria',
  lastName: 'Silva',
  email: 'maria.silva@stockflow.com',
  password: 'SecurePass@123',
  role: 'USER',
}

export const userResponseExample = {
  id: EXAMPLE_UUID,
  companyId: EXAMPLE_COMPANY_ID,
  firstName: 'Maria',
  lastName: 'Silva',
  email: 'maria.silva@stockflow.com',
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-06-13T12:00:00.000Z',
  updatedAt: '2026-06-13T12:00:00.000Z',
}

export const paginatedUsersResponseExample = {
  data: [userResponseExample],
  pagination: {
    page: 1,
    limit: 10,
    totalItems: 42,
    totalPages: 5,
    hasNextPage: true,
    hasPreviousPage: false,
  },
}

export const validationErrorExample = {
  success: false,
  message: 'Password must be at least 8 characters, Role must be ADMIN, MANAGER or USER',
  error: {
    code: 'VALIDATION_ERROR',
    details: [],
  },
  requestId: '550e8400-e29b-41d4-a716-446655440000',
}

export const forbiddenErrorExample = {
  success: false,
  message: 'Forbidden',
  error: {
    code: 'FORBIDDEN',
    details: [],
  },
  requestId: '550e8400-e29b-41d4-a716-446655440000',
}

export const unauthorizedErrorExample = {
  success: false,
  message: 'Unauthorized',
  error: {
    code: 'UNAUTHORIZED',
    details: [],
  },
  requestId: '550e8400-e29b-41d4-a716-446655440000',
}

export const successEnvelopeExample = {
  success: true,
  message: 'Operation completed successfully',
  data: {},
}

export const healthResponseExample = {
  status: 'ok',
  timestamp: '2026-06-15T00:00:00.000Z',
  uptime: 3600,
  environment: 'development',
  service: 'StockFlow API',
}

export const readyResponseExample = {
  status: 'ready',
  services: {
    database: 'up',
    redis: 'up',
  },
}
