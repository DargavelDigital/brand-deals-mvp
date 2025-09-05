// src/app/api/tiktok/status/route.ts
import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { CK_TIKTOK_CONNECTED, CK_TIKTOK_ACCESS, getCookie } from '@/services/tiktok/cookies'

export async function GET() {
  try {
    const connectedCookie = getCookie(CK_TIKTOK_CONNECTED) === '1'
    const hasAccess = Boolean(getCookie(CK_TIKTOK_ACCESS))
    const connected = connectedCookie || hasAccess

    return NextResponse.json({ ok: true, connected })
  } catch (err) {
    log.error({ err }, '[tiktok/status] failed')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}