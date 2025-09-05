// src/app/api/tiktok/disconnect/route.ts
import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'

function clear(res: NextResponse, name: string) {
  // Clear via empty value + maxAge 0
  res.cookies.set(name, '', { path: '/', maxAge: 0 })
}

async function handle() {
  try {
    const res = NextResponse.json({ ok: true, disconnected: true })

    // Clear everything TikTok-related we may have set
    clear(res, 'tiktok_access_token')
    clear(res, 'tiktok_refresh_token')
    clear(res, 'tiktok_connected')
    clear(res, 'tiktok_state')

    return res
  } catch (err) {
    log.error({ err }, '[tiktok/disconnect] unhandled')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

// Support both verbs to avoid 405s.
export const GET = handle
export const POST = handle