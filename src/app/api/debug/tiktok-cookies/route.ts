// src/app/api/debug/tiktok-cookies/route.ts
import { NextResponse } from 'next/server'
import { CK_TIKTOK_CONNECTED, CK_TIKTOK_ACCESS, CK_TIKTOK_REFRESH, getCookie } from '@/services/tiktok/cookies'

export async function GET() {
  const connected = getCookie(CK_TIKTOK_CONNECTED)
  const hasAccess = !!getCookie(CK_TIKTOK_ACCESS)
  const hasRefresh = !!getCookie(CK_TIKTOK_REFRESH)

  return NextResponse.json({
    ok: true,
    cookies: {
      connected,
      has_access: hasAccess,
      has_refresh: hasRefresh
    }
  })
}
