import type { Response } from 'express'

import type { ApiSuccessResponse, PaginatedResponse } from '../types/index.js'

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
): Response<ApiSuccessResponse<T>> {
  return res.status(statusCode).json({
    status: 'success',
    data,
  })
}

export function sendCreated<T>(res: Response, data: T): Response<ApiSuccessResponse<T>> {
  return sendSuccess(res, data, 201)
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send()
}

export function sendPaginated<T>(
  res: Response,
  data: T,
  meta: PaginatedResponse<T>['meta'],
): Response<PaginatedResponse<T>> {
  return res.status(200).json({
    status: 'success',
    data,
    meta,
  })
}
