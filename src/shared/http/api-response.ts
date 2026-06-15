import type { Request, Response } from 'express'

import { resolveErrorCode } from '../errors/error-codes.js'
import type {
  ApiErrorResponse,
  ApiPaginatedSuccessResponse,
  ApiSuccessResponse,
  PaginationMeta,
} from '../types/index.js'

export function successResponse<T>(
  res: Response,
  data: T,
  message = 'Operation completed successfully',
  statusCode = 200,
): Response<ApiSuccessResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export function paginatedResponse<T>(
  res: Response,
  payload: { data: T[]; pagination: PaginationMeta },
  message: string,
): Response<ApiPaginatedSuccessResponse<T>> {
  return res.status(200).json({
    success: true,
    message,
    data: payload.data,
    pagination: payload.pagination,
  })
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message = 'Resource created successfully',
): Response<ApiSuccessResponse<T>> {
  return successResponse(res, data, message, 201)
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send()
}

export function buildErrorResponseBody(
  req: Request,
  message: string,
  options: { code?: string; statusCode?: number; details?: unknown[] } = {},
): ApiErrorResponse {
  const statusCode = options.statusCode ?? 500

  return {
    success: false,
    message,
    error: {
      code: options.code ?? resolveErrorCode(statusCode),
      details: options.details ?? [],
    },
    requestId: req.requestId,
  }
}

export function errorResponse(
  res: Response,
  req: Request,
  message: string,
  statusCode: number,
  options?: { code?: string; details?: unknown[] },
): Response<ApiErrorResponse> {
  return res.status(statusCode).json(
    buildErrorResponseBody(req, message, {
      ...options,
      statusCode,
    }),
  )
}
