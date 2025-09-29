import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { env, flag } from '@/lib/env'
import { flags } from '@/lib/flags'
import { getAllConnectionStatus } from '@/services/connections/status'

export async function GET(req: Request) {
  try {
    // Get current workspace ID
    let currentWorkspaceId: string
    try {
      const { workspaceId } = await requireSessionOrDemo(req)
      currentWorkspaceId = workspaceId
    } catch (e) {
      log.warn({ e }, '[instagram/status] failed to get workspace ID')
      return NextResponse.json({ ok: false, error: 'NOT_AUTHENTICATED' }, { status: 401 })
    }

    // Check environment configuration
    const hasAppId = !!process.env.INSTAGRAM_APP_ID
    const hasSecret = !!process.env.INSTAGRAM_APP_SECRET
    const appUrlSet = !!process.env.APP_URL
    const featureEnabled = flags.social.instagram

    const configured = hasAppId && hasSecret && appUrlSet && featureEnabled

    // Determine reason
    let reason: 'OK' | 'MISSING_ENV' | 'FEATURE_OFF'
    if (!hasAppId || !hasSecret || !appUrlSet) {
      reason = 'MISSING_ENV'
    } else if (!featureEnabled) {
      reason = 'FEATURE_OFF'
    } else {
      reason = 'OK'
    }

    // Check if Instagram is connected for this workspace
    const allConnections = await getAllConnectionStatus()
    const instagramConnection = allConnections.find(conn => conn.platform === 'instagram')
    const connected = instagramConnection?.connected || false

    const response = {
      ok: true,
      configured,
      connected,
      reason,
      details: {
        hasAppId,
        hasSecret,
        appUrlSet,
        redirectUri: `${process.env.APP_URL}/api/instagram/auth/callback`,
        featureEnabled,
      }
    }

    log.info({ 
      currentWorkspaceId, 
      configured, 
      connected, 
      reason 
    }, '[instagram/status] status check completed')

    return NextResponse.json(response)
  } catch (err) {
    log.error({ err }, '[instagram/status] unhandled error')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
