import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),
  RATE_LIMIT_ENABLED: z.preprocess((value) => {
    if (value === undefined || value === '') {
      return undefined
    }

    if (value === true || value === 'true') {
      return true
    }

    if (value === false || value === 'false') {
      return false
    }

    return value
  }, z.boolean().optional()),
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_GLOBAL_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_LOGIN_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_REGISTER_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_REGISTER_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60 * 1000),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  CACHE_ENABLED: z.preprocess((value) => {
    if (value === undefined || value === '') {
      return undefined
    }

    if (value === true || value === 'true') {
      return true
    }

    if (value === false || value === 'false') {
      return false
    }

    return value
  }, z.boolean().optional()),
  PUBLIC_URL: z.string().url().optional(),
  HOST: z.string().default('0.0.0.0'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
