import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';
import { randomUUID } from 'crypto';

export function withTrace(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const traceId = req.headers.get('x-trace-id') || randomUUID();
    const started = Date.now();
    try {
      const res = await handler(new Proxy(req, {
        get(target, prop) {
          // attach traceId via symbol or provide getter
          return (prop === 'traceId') ? traceId : (target as any)[prop];
        }
      }) as any);
      log.info({ traceId, path: req.nextUrl.pathname, ms: Date.now() - started }, 'api ok');
      return res;
    } catch (e: any) {
      log.error({ traceId, path: req.nextUrl.pathname, err: e?.message }, 'api error');
      return NextResponse.json({ ok: false, traceId, error: 'SERVER_ERROR' }, { status: 500 });
    }
  }
}
