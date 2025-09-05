// src/app/api/tiktok/disconnect/route.ts
import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { CK_TIKTOK_CONNECTED, CK_TIKTOK_ACCESS, CK_TIKTOK_REFRESH, clearCookie } from '@/services/tiktok/cookies'

async function handle() {
  try {
    const res = NextResponse.json({ ok: true, disconnected: true })

    // Clear all TikTok-related cookies
    res.cookies.set(CK_TIKTOK_CONNECTED, '', { path: '/', maxAge: 0 })
    res.cookies.set(CK_TIKTOK_ACCESS, '', { path: '/', maxAge: 0 })
    res.cookies.set(CK_TIKTOK_REFRESH, '', { path: '/', maxAge: 0 })

    return res
  } catch (err) {
    log.error({ err }, '[tiktok/disconnect] unhandled')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

// Support both verbs to avoid 405s.
export const GET = handle
export const POST = handle