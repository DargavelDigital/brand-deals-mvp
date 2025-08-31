// src/lib/diag/trace.ts
import crypto from 'crypto'
import { env } from '../env'

export function newTraceId() {
  return crypto.randomUUID?.() || crypto.randomBytes(16).toString('hex')
}

export function logServerError(ctx: { route: string; method?: string; traceId: string; err: any; extra?: Record<string, any> }) {
  const { route, method = 'GET', traceId, err, extra } = ctx
  const meta = {
    route,
    method,
    traceId,
    name: err?.name,
    code: err?.code,
    message: err?.message,
    stack: env.NODE_ENV !== 'production' ? err?.stack : undefined,
    ...extra,
  }
  console.error('[API_ERROR]', JSON.stringify(meta))
}
