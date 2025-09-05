// src/app/api/tiktok/status/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'

export async function GET() {
  try {
    const jar = cookies()
    // Consider "connected" if we have an access token OR an explicit connected flag
    const connected =
      Boolean(jar.get('tiktok_access_token')?.value) ||
      jar.get('tiktok_connected')?.value === '1'

    return NextResponse.json({ ok: true, connected })
  } catch (err) {
    log.error({ err }, '[tiktok/status] failed')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}