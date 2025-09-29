import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    // Check environment configuration first - return early if missing
    const hasEnv = !!process.env.META_APP_ID && 
                   !!process.env.META_APP_SECRET && 
                   !!process.env.META_REDIRECT_URI;

    if (!hasEnv) {
      log.info('[instagram/status] environment not configured')
      return NextResponse.json({
        ok: true,
        configured: false,
        connected: false,
        reason: 'NOT_CONFIGURED',
      });
    }

    // Get current workspace ID
    let currentWorkspaceId: string
    try {
      const { workspaceId } = await requireSessionOrDemo(req)
      currentWorkspaceId = workspaceId
    } catch (e) {
      log.warn({ e }, '[instagram/status] failed to get workspace ID')
      return NextResponse.json({
        ok: true,
        configured: false,
        connected: false,
        reason: 'NOT_CONFIGURED',
        detail: 'Authentication required'
      });
    }

    // Check if Instagram is connected for this workspace
    const socialAccount = await prisma().socialAccount.findFirst({
      where: {
        workspaceId: currentWorkspaceId,
        platform: 'instagram'
      }
    })

    const connected = !!(socialAccount && socialAccount.accessToken)

    // Determine reason and authUrl
    let reason: string | null = null
    let authUrl: string | null = null

    if (connected) {
      // Connected and working
      reason = null
    } else {
      reason = 'NOT_CONNECTED'
      authUrl = '/api/instagram/auth/start'
    }

    const response = {
      ok: true,
      configured: true,
      connected,
      authUrl,
      reason
    }

    log.info({ 
      currentWorkspaceId, 
      configured: true, 
      connected, 
      reason 
    }, '[instagram/status] status check completed')

    return NextResponse.json(response)
  } catch (err: any) {
    log.error({ err }, '[instagram/status] unhandled error')
    return NextResponse.json({
      ok: true,
      configured: false,
      connected: false,
      reason: 'NOT_CONFIGURED',
      detail: err?.message ?? 'Unknown error',
    });
  }
}
