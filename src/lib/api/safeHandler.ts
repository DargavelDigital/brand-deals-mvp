// src/lib/api/safeHandler.ts
import { NextResponse } from 'next/server'
import { logServerError, newTraceId } from '@/lib/diag/trace'
import { env } from '@/lib/env'

type Handler = (req: Request) => Promise<Response> | Response

export function safe(handler: Handler, opts?: { route?: string }) {
  return async (req: Request) => {
    const traceId = newTraceId()
    try {
      const res = await handler(req)
      return res
    } catch (err: any) {
      logServerError({
        route: opts?.route || 'unknown',
        method: req.method,
        traceId,
        err,
        extra: {
          url: (req as any).url,
          hasDb: !!env.DATABASE_URL,
          billingEnabled: env.FEATURE_BILLING_ENABLED,
        }
      })
      return NextResponse.json(
        { ok: false, traceId, error: err?.code || err?.name || 'INTERNAL_ERROR', message: env.NODE_ENV !== 'production' ? err?.message : 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
