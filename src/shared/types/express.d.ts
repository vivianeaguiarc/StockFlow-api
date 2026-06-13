import type { AuthenticatedUser } from './authenticated-user.js'

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
      requestId: string
      correlationId: string
    }
  }
}

export {}
