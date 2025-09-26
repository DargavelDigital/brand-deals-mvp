import { NextRequest, NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { signPayload } from '@/lib/signing'

export const POST = withIdempotency(async (req: NextRequest) => {
  const data = await req.text()
  const json = data ? JSON.parse(data) : {}
  const t = signPayload(json, '10m')
  return NextResponse.json({ t })
});
