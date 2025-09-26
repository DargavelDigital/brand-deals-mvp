// src/app/api/tiktok/disconnect/route.ts
import { NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { cookies } from 'next/headers'
import { log } from '@/lib/logger'

async function POST_impl() {
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
  return NextResponse.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 })
}