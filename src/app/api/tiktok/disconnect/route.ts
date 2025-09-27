// src/app/api/tiktok/disconnect/route.ts
import { NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { cookies } from 'next/headers'
import { log } from '@/lib/logger'
import { socials, COMING_SOON_MSG } from '@/config/socials'

function comingSoon() {
  return NextResponse.json({ ok: false, code: 'COMING_SOON', message: COMING_SOON_MSG }, { status: 501 })
}

async function POST_impl() {
  if (!socials.enabled('tiktok')) return comingSoon()
  
  try {
    const res = NextResponse.json({ ok: true, disconnected: true })

    // Clear tiktok_conn cookie
    res.cookies.set('tiktok_conn', '', { path: '/', maxAge: 0 })

    log.info('[tiktok/disconnect] TikTok connection disconnected')
    return res
  } catch (err) {
    log.error({ err }, '[tiktok/disconnect] unhandled error')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

export const POST = withIdempotency(POST_impl);

// Return 405 for non-POST methods
export async function GET() {
  if (!socials.enabled('tiktok')) return comingSoon()
  return NextResponse.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 })
}