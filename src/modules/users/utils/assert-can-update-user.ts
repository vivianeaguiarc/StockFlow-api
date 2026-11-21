import type { UserRole } from '@prisma/client'

import { AppError } from '../../../shared/errors/AppError.js'
import type { UpdateUserDto } from '../dtos/update-user.dto.js'

const FORBIDDEN_MESSAGE = 'Forbidden'

export type UserUpdateActor = {
  id: string
  role: UserRole
}

export type UserUpdateTarget = {
  id: string
  role: UserRole
}

/** Campos que um MANAGER pode alterar no próprio perfil. */
const MANAGER_SELF_FIELDS = ['firstName', 'lastName'] as const

/** Campos que um MANAGER pode alterar em um usuário com papel USER. */
const MANAGER_ON_USER_FIELDS = ['firstName', 'lastName', 'status'] as const

function providedFields(data: UpdateUserDto): string[] {
  return Object.entries(data)
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key)
}

function onlyAllowed(data: UpdateUserDto, allowed: readonly string[]): boolean {
  return providedFields(data).every((field) => allowed.includes(field))
}

/**
 * Regras de autorização para PATCH /users/:id.
 *
 * - ADMIN: pode alterar qualquer usuário da própria empresa
 *   (a regra de "último admin" continua no service).
 * - MANAGER: no próprio perfil, só nome e sobrenome; em usuários USER,
 *   só nome, sobrenome e status. Nunca altera ADMIN, outros MANAGER,
 *   senha, e-mail ou papel de ninguém.
 * - USER: não chega aqui (bloqueado na rota), mas é negado por segurança.
 */
export function assertCanUpdateUser(
  actor: UserUpdateActor,
  target: UserUpdateTarget,
  data: UpdateUserDto,
): void {
  if (actor.role === 'ADMIN') {
    return
  }

  if (actor.role === 'MANAGER') {
    if (actor.id === target.id) {
      if (onlyAllowed(data, MANAGER_SELF_FIELDS)) {
        return
      }

      throw new AppError(FORBIDDEN_MESSAGE, 403)
    }

    if (target.role === 'USER' && onlyAllowed(data, MANAGER_ON_USER_FIELDS)) {
      return
    }
  }

  throw new AppError(FORBIDDEN_MESSAGE, 403)
}
