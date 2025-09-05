// src/app/api/tiktok/refresh/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'

// If you already have a helper in your TikTok service, use it here.
// Otherwise this fallback will simply return the existing access token.
async function refreshAccessTokenSafe(refreshToken: string | undefined) {
  try {
    // Optional: import your real refresh helper if it exists:
    // const { refreshAccessToken } = await import('@/services/tiktok/api')
    // return await refreshAccessToken(refreshToken)

    // Fallback no-op: if no refresh token, signal not connected.
    if (!refreshToken) return { ok: false as const, reason: 'NO_REFRESH_TOKEN' }
    // If you want to prove the route works before wiring real refresh:
    return { ok: true as const, access_token: null, refreshed: false }
  } catch (err) {
    return { ok: false as const, reason: 'REFRESH_FAILED', err }
  }
}

async function handle() {
  try {
    const jar = cookies()
    const refreshToken = jar.get('tiktok_refresh_token')?.value

    const result = await refreshAccessTokenSafe(refreshToken)

    if (!result.ok) {
      if (result.reason === 'NO_REFRESH_TOKEN') {
        return NextResponse.json({ ok: false, error: 'NOT_CONNECTED' }, { status: 400 })
      }
      log.warn({ result }, '[tiktok/refresh] failed')
      return NextResponse.json({ ok: false, error: 'REFRESH_FAILED' }, { status: 502 })
    }

    // If your real refresher returns a new token, set it here.
    // const res = NextResponse.json({ ok: true, refreshed: true })
    const res = NextResponse.json({ ok: true, refreshed: result.refreshed === true })

    // Example of setting tokens if you have them:
    // if (result.access_token) {
    //   res.cookies.set('tiktok_access_token', result.access_token, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'lax',
    //     path: '/',
    //     maxAge: 60 * 60, // 1h
    //   })
    //   res.cookies.set('tiktok_connected', '1', { path: '/', sameSite: 'lax', secure: true })
    // }

    return res
  } catch (err) {
    log.error({ err }, '[tiktok/refresh] unhandled')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

// Support both GET and POST to avoid 405s.
export const GET = handle
export const POST = handle