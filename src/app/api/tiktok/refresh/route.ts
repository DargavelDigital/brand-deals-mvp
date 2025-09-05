// src/app/api/tiktok/refresh/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { env, flag } from '@/lib/env'

type TikTokConnData = {
  wsid: string
  createdAt: string
  provider: 'tiktok'
}

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

export async function POST(req: Request) {
  try {
    // Check if refresh is supported
    if (!flag(env.TIKTOK_REFRESH_SUPPORTED)) {
      log.info('[tiktok/refresh] refresh not supported in sandbox mode')
      return NextResponse.json({ ok: false, error: 'REFRESH_NOT_SUPPORTED' }, { status: 400 })
    }

    // Get current workspace ID
    let currentWorkspaceId: string
    try {
      const { workspaceId } = await requireSessionOrDemo(req)
      currentWorkspaceId = workspaceId
    } catch (e) {
      log.warn({ e }, '[tiktok/refresh] failed to get workspace ID')
      return NextResponse.json({ ok: false, error: 'NOT_CONNECTED' }, { status: 400 })
    }

    // Check tiktok_conn cookie
    const jar = cookies()
    const tiktokConnCookie = jar.get('tiktok_conn')?.value

    if (!tiktokConnCookie) {
      log.warn({ currentWorkspaceId }, '[tiktok/refresh] no tiktok_conn cookie found')
      return NextResponse.json({ ok: false, error: 'NOT_CONNECTED' }, { status: 400 })
    }

    try {
      const connData: TikTokConnData = JSON.parse(tiktokConnCookie)
      
      if (connData.wsid !== currentWorkspaceId) {
        log.warn({ 
          cookieWsid: connData.wsid, 
          currentWsid: currentWorkspaceId 
        }, '[tiktok/refresh] workspace ID mismatch')
        return NextResponse.json({ ok: false, error: 'NOT_CONNECTED' }, { status: 400 })
      }
    } catch (e) {
      log.warn({ e }, '[tiktok/refresh] failed to parse tiktok_conn cookie')
      return NextResponse.json({ ok: false, error: 'NOT_CONNECTED' }, { status: 400 })
    }

    // Perform refresh logic (placeholder for now)
    const result = await refreshAccessTokenSafe(undefined)

    if (!result.ok) {
      log.warn({ result }, '[tiktok/refresh] refresh failed')
      return NextResponse.json({ ok: false, error: 'REFRESH_FAILED' }, { status: 502 })
    }

    log.info({ currentWorkspaceId }, '[tiktok/refresh] refresh completed successfully')
    return NextResponse.json({ ok: true, refreshed: true })
  } catch (err) {
    log.error({ err }, '[tiktok/refresh] unhandled error')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

// Return 405 for non-POST methods
export async function GET() {
  return NextResponse.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 })
}