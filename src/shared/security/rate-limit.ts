import type { Request, RequestHandler } from 'express'
import rateLimit, { type Options, type Store } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'

import { env } from '../../config/env.js'
import { getRedisClient, isCacheEnabled } from '../cache/redis-client.js'
import { logWarn } from '../logger/logger.js'

export const RATE_LIMIT_MESSAGE = 'Too many requests'
export const JWT_ALGORITHM = 'HS256' as const

export function isRateLimitEnabled(): boolean {
  if (env.RATE_LIMIT_ENABLED !== undefined) {
    return env.RATE_LIMIT_ENABLED
  }

  return env.NODE_ENV !== 'test'
}

export function shouldSkipGlobalRateLimit(req: Request): boolean {
  const publicPathsWithoutRateLimit = [
    '/api/docs',
    '/api/v1/docs',
    '/api/v1/health',
    '/api/health',
    '/api/v1/ready',
    '/api/ready',
  ]

  return publicPathsWithoutRateLimit.some((path) => {
    return req.path.startsWith(path) || req.originalUrl.startsWith(path)
  })
}

export function buildLoginRateLimitKey(req: Request): string {
  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : 'unknown-email'

  return `login:${req.ip}:${email}`
}

export function buildRefreshRateLimitKey(req: Request): string {
  return `refresh:${req.ip}`
}

function createLimitedHandler(limiterName: string): NonNullable<Options['handler']> {
  return (req, res, _next, options) => {
    logWarn(
      {
        limiter: limiterName,
        ip: req.ip,
        method: req.method,
        route: req.originalUrl,
        limit: options.limit,
        windowMs: options.windowMs,
      },
      'Rate limit exceeded',
    )

    res.status(options.statusCode).json({
      status: 'error',
      message: RATE_LIMIT_MESSAGE,
      requestId: req.requestId,
    })
  }
}

const noopRateLimiter: RequestHandler = (_req, _res, next) => {
  next()
}

async function resolveRedisStore(prefix: string): Promise<Store | undefined> {
  if (!isRateLimitEnabled() || !isCacheEnabled()) {
    return undefined
  }

  const client = await getRedisClient()

  if (!client) {
    return undefined
  }

  return new RedisStore({
    sendCommand: (...args: string[]) => client.sendCommand(args),
    prefix: `stockflow:rl:${prefix}:`,
  })
}

type RateLimiterOptions = {
  skip?: Options['skip']
  keyGenerator?: Options['keyGenerator']
}

function createRateLimiterHandler(
  limiterName: string,
  max: number,
  windowMs: number,
  options: RateLimiterOptions = {},
): RequestHandler {
  if (!isRateLimitEnabled()) {
    return noopRateLimiter
  }

  let limiter: RequestHandler | undefined

  return async (req, res, next) => {
    if (!limiter) {
      const store = await resolveRedisStore(limiterName)

      limiter = rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        ...(store ? { store } : {}),
        ...(options.skip ? { skip: options.skip } : {}),
        ...(options.keyGenerator ? { keyGenerator: options.keyGenerator } : {}),
        handler: createLimitedHandler(limiterName),
      })
    }

    return limiter(req, res, next)
  }
}

export const globalRateLimiter: RequestHandler = createRateLimiterHandler(
  'global',
  env.RATE_LIMIT_GLOBAL_MAX,
  env.RATE_LIMIT_GLOBAL_WINDOW_MS,
  { skip: shouldSkipGlobalRateLimit },
)

export const loginRateLimiter: RequestHandler = createRateLimiterHandler(
  'login',
  env.RATE_LIMIT_LOGIN_MAX,
  env.RATE_LIMIT_LOGIN_WINDOW_MS,
  { keyGenerator: buildLoginRateLimitKey },
)

export const refreshRateLimiter: RequestHandler = createRateLimiterHandler(
  'refresh',
  env.RATE_LIMIT_REFRESH_MAX,
  env.RATE_LIMIT_REFRESH_WINDOW_MS,
  { keyGenerator: buildRefreshRateLimitKey },
)

export const registerRateLimiter: RequestHandler = createRateLimiterHandler(
  'register',
  env.RATE_LIMIT_REGISTER_MAX,
  env.RATE_LIMIT_REGISTER_WINDOW_MS,
)
