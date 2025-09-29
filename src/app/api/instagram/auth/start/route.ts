import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { log } from '@/lib/logger'
import { getAuthUrl } from '@/services/instagram/meta'

export async function GET() {
  try {
    // Check if environment variables exist
    const hasAppId = !!process.env.INSTAGRAM_APP_ID
    const hasSecret = !!process.env.INSTAGRAM_APP_SECRET
    const appUrlSet = !!process.env.APP_URL

    if (!hasAppId || !hasSecret || !appUrlSet) {
      return NextResponse.json({
        ok: true,
        configured: false,
        url: null,
        reason: 'NOT_CONFIGURED'
      })
    }

    // Generate crypto-random state
    const state = crypto.randomUUID()
    
    // Set state cookie
    const cookieStore = await cookies()
    cookieStore.set('ig_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10, // 10 minutes
      path: '/'
    })

    // Generate OAuth URL
    const url = getAuthUrl({ state })

    log.info({ state }, '[instagram/auth/start] generated OAuth URL')

    return NextResponse.json({
      ok: true,
      configured: true,
      url
    })
  } catch (err) {
    log.error({ err }, '[instagram/auth/start] unhandled error')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}