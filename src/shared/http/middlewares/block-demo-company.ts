import type { NextFunction, Request, Response } from 'express'

import { AppError } from '../../errors/AppError.js'
import { ERROR_CODES } from '../../errors/error-codes.js'

export const DEMO_READ_ONLY_MESSAGE = 'This action is disabled for the demo company'

type BlockDemoCompanyOptions = {
  /**
   * Bloqueia só quando a função retornar true (ex.: só se o body tiver `password`).
   * Sem essa opção, a rota inteira fica bloqueada para a empresa demo.
   */
  when?: (req: Request) => boolean
}

/**
 * Impede ações destrutivas ou sensíveis em empresas de demonstração
 * (Company.isDemo = true), para que visitantes não quebrem o demo público.
 *
 * Use depois de `authenticate` (precisa de `req.user`).
 */
export function blockDemoCompany(options: BlockDemoCompanyOptions = {}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user?.isDemoCompany) {
      next()
      return
    }

    if (options.when && !options.when(req)) {
      next()
      return
    }

    next(new AppError(DEMO_READ_ONLY_MESSAGE, 403, { code: ERROR_CODES.DEMO_READ_ONLY }))
  }
}

/** true quando o body da requisição contém algum dos campos informados. */
export function bodyHasAnyField(...fields: string[]) {
  return (req: Request): boolean => {
    const body: unknown = req.body

    if (body === null || typeof body !== 'object') {
      return false
    }

    return fields.some((field) => (body as Record<string, unknown>)[field] !== undefined)
  }
}
