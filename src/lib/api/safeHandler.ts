// src/lib/api/safeHandler.ts
import { NextResponse } from 'next/server'
import { logServerError, newTraceId } from '@/lib/diag/trace'

type Handler = (req: Request) => Promise<Response> | Response

export function safe(handler: Handler, opts?: { route?: string }) {
  return async (req: Request) => {
    const traceId = newTraceId()
    try {
      const res = await handler(req)
      return res
    } catch (err: any) {
      logServerError({ route: opts?.route || 'unknown', traceId, err })
      return NextResponse.json(
        { ok: false, traceId, error: err?.code || err?.name || 'INTERNAL_ERROR', message: process.env.NODE_ENV !== 'production' ? err?.message : 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
