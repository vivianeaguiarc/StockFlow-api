import type { Request, RequestHandler } from 'express'
import rateLimit, { type Options } from 'express-rate-limit'

import { env } from '../../config/env.js'
import { logWarn } from '../logger/logger.js'

export const RATE_LIMIT_MESSAGE = 'Too many requests'

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
    })
  }
}

const noopRateLimiter: RequestHandler = (_req, _res, next) => {
  next()
}

function createRateLimiter(
  limiterName: string,
  max: number,
  windowMs: number,
  skip?: Options['skip'],
): RequestHandler {
  if (!isRateLimitEnabled()) {
    return noopRateLimiter
  }

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    ...(skip ? { skip } : {}),
    handler: createLimitedHandler(limiterName),
  })
}

export const globalRateLimiter: RequestHandler = createRateLimiter(
  'global',
  env.RATE_LIMIT_GLOBAL_MAX,
  env.RATE_LIMIT_GLOBAL_WINDOW_MS,
  shouldSkipGlobalRateLimit,
)

export const loginRateLimiter: RequestHandler = createRateLimiter(
  'login',
  env.RATE_LIMIT_LOGIN_MAX,
  env.RATE_LIMIT_LOGIN_WINDOW_MS,
)

export const registerRateLimiter: RequestHandler = createRateLimiter(
  'register',
  env.RATE_LIMIT_REGISTER_MAX,
  env.RATE_LIMIT_REGISTER_WINDOW_MS,
)
