import { PrismaUsersRepository } from './prisma-users.repository.js'
import type { UsersRepository } from './users.repository.js'

export type {
  CreateUserRecord,
  RegisterCompanyWithAdminInput,
  RegisterCompanyWithAdminResult,
  UserProfile,
  UsersRepository,
  UserWithCompany,
} from './users.repository.js'

export function createUsersRepository(): UsersRepository {
  return new PrismaUsersRepository()
}

export const usersRepository = createUsersRepository()
