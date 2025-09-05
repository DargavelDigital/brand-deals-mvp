// src/app/api/tiktok/status/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'

type TikTokConnData = {
  wsid: string
  createdAt: string
  provider: 'tiktok'
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