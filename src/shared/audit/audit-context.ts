import type { Request } from 'express'

export type AuditContext = {
  ipAddress?: string | null
  userAgent?: string | null
}

export function getAuditContext(req: Request): AuditContext {
  return {
    ipAddress: req.ip ?? req.socket.remoteAddress ?? null,
    userAgent: req.get('user-agent') ?? null,
  }
}
