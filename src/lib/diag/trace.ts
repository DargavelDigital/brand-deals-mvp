// src/lib/diag/trace.ts
import crypto from 'crypto'

export function newTraceId() {
  return crypto.randomUUID?.() || crypto.randomBytes(16).toString('hex')
}

export function logServerError(ctx: { route: string; traceId: string; err: any }) {
  const { route, traceId, err } = ctx
  const meta = {
    route,
    traceId,
    name: err?.name,
    code: err?.code,
    message: err?.message,
    stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined,
  }
  console.error('[API_ERROR]', JSON.stringify(meta))
}
