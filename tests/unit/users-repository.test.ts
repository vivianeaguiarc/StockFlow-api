import { describe, expect, it } from 'vitest'

import { PrismaUsersRepository } from '../../src/modules/users/repositories/prisma-users.repository.js'
import type { UsersRepository } from '../../src/modules/users/repositories/users.repository.js'

describe('UsersRepository contract', () => {
  it('PrismaUsersRepository implements UsersRepository interface', () => {
    const repository: UsersRepository = new PrismaUsersRepository()

    expect(repository.findActiveByEmailWithCompany).toBeTypeOf('function')
    expect(repository.registerCompanyWithAdmin).toBeTypeOf('function')
  })
})
