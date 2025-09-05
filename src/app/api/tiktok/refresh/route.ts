// src/app/api/tiktok/refresh/route.ts
import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { CK_TIKTOK_REFRESH, CK_TIKTOK_ACCESS, CK_TIKTOK_CONNECTED, getCookie } from '@/services/tiktok/cookies'

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
    const refreshToken = getCookie(CK_TIKTOK_REFRESH)
    
    if (!refreshToken) {
      return NextResponse.json({ ok: false, error: 'NOT_CONNECTED' }, { status: 400 })
    }

    const result = await refreshAccessTokenSafe(refreshToken)

    if (!result.ok) {
      log.warn({ result }, '[tiktok/refresh] failed')
      return NextResponse.json({ ok: false, error: 'REFRESH_FAILED' }, { status: 502 })
    }

    const res = NextResponse.json({ ok: true, refreshed: result.refreshed === true })

    // Set tokens on success
    if (result.access_token) {
      const oneHour = 60 * 60
      const thirtyDays = 30 * 24 * 60 * 60
      
      res.cookies.set(CK_TIKTOK_ACCESS, result.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: result.expires_in ?? oneHour,
      })
      
      // Set updated refresh token if returned
      if (result.refresh_token) {
        res.cookies.set(CK_TIKTOK_REFRESH, result.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: result.refresh_expires_in ?? thirtyDays,
        })
      }
      
      // Always set connected flag on success
      res.cookies.set(CK_TIKTOK_CONNECTED, '1', {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: thirtyDays,
      })
    }

    return res
  } catch (err) {
    log.error({ err }, '[tiktok/refresh] unhandled')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

// Support both GET and POST to avoid 405s.
export const GET = handle
export const POST = handle