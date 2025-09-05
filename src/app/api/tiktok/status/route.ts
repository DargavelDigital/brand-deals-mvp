// src/app/api/tiktok/status/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'

type TikTokConnData = {
  wsid: string
  createdAt: string
  provider: 'tiktok'
  access_token?: string
  expires_at?: string
}

export async function GET(req: Request) {
  try {
    // Get current workspace ID
    let currentWorkspaceId: string
    try {
      const { workspaceId } = await requireSessionOrDemo(req)
      currentWorkspaceId = workspaceId
    } catch (e) {
      log.warn({ e }, '[tiktok/status] failed to get workspace ID')
      return NextResponse.json({ ok: true, connected: false })
    }

    // Check tiktok_conn cookie
    const jar = cookies()
    const tiktokConnCookie = jar.get('tiktok_conn')?.value

    if (!tiktokConnCookie) {
      log.info({ currentWorkspaceId }, '[tiktok/status] no tiktok_conn cookie found')
      return NextResponse.json({ ok: true, connected: false })
    }

    try {
      const connData: TikTokConnData = JSON.parse(tiktokConnCookie)
      
      if (connData.wsid !== currentWorkspaceId) {
        log.warn({ 
          cookieWsid: connData.wsid, 
          currentWsid: currentWorkspaceId 
        }, '[tiktok/status] workspace ID mismatch')
        return NextResponse.json({ ok: true, connected: false })
      }

      // Check if access token exists and is not expired
      const hasValidToken = connData.access_token && 
        (!connData.expires_at || Date.now() < new Date(connData.expires_at).getTime())

      if (!hasValidToken) {
        log.info({ 
          currentWorkspaceId, 
          hasToken: !!connData.access_token,
          expiresAt: connData.expires_at 
        }, '[tiktok/status] TikTok token expired or missing')
        return NextResponse.json({ ok: true, connected: false })
      }

      log.info({ currentWorkspaceId }, '[tiktok/status] TikTok connected for workspace')
      return NextResponse.json({ ok: true, connected: true })
    } catch (e) {
      log.warn({ e }, '[tiktok/status] failed to parse tiktok_conn cookie')
      return NextResponse.json({ ok: true, connected: false })
    }
  } catch (err) {
    log.error({ err }, '[tiktok/status] failed')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

// Return 405 for non-GET methods
export async function POST() {
  return NextResponse.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 })
}