import type { Prisma } from '@prisma/client'

import type { ListUsersQuery } from '../dtos/list-users-query.dto.js'

export function buildUsersListWhere(
  companyId: string,
  query: Pick<ListUsersQuery, 'role' | 'name' | 'email'>,
): Prisma.UserWhereInput {
  const { role, name, email } = query

  return {
    companyId,
    deletedAt: null,
    ...(role && { role }),
    ...(name && {
      OR: [
        { firstName: { contains: name, mode: 'insensitive' } },
        { lastName: { contains: name, mode: 'insensitive' } },
      ],
    }),
    ...(email && {
      email: {
        contains: email,
        mode: 'insensitive',
      },
    }),
  }
}
