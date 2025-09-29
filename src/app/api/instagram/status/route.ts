import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { prisma } from '@/lib/prisma'

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

    const configured = hasAppId && hasSecret && appUrlSet

    // Check if Instagram is connected for this workspace
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        workspaceId: currentWorkspaceId,
        platform: 'instagram'
      }
    })

    const connected = !!(socialAccount && socialAccount.accessToken)

    // Determine reason and authUrl
    let reason: string | null = null
    let authUrl: string | null = null

    if (!configured) {
      reason = 'NOT_CONFIGURED'
    } else if (configured && !connected) {
      reason = 'NOT_CONNECTED'
      authUrl = '/api/instagram/auth/start'
    }

    const response = {
      ok: true,
      configured,
      connected,
      authUrl,
      reason
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
