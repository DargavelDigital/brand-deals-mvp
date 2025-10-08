import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { prisma } from '@/lib/prisma'
import { getUserProfile } from '@/services/instagram/meta'

export async function GET(req: Request) {
  try {
    // Get current workspace ID
    let workspaceId: string
    try {
      const { workspaceId: wsid } = await requireSessionOrDemo(req)
      workspaceId = wsid
    } catch (e) {
      log.warn({ e }, '[instagram/me] failed to get workspace ID')
      return NextResponse.json({ ok: false, error: 'NOT_AUTHENTICATED' }, { status: 401 })
    }

    // Lookup Instagram SocialAccount
    const socialAccount = await prisma().socialAccount.findFirst({
      where: {
        workspaceId,
        platform: 'instagram'
      }
    })

    if (!socialAccount || !socialAccount.accessToken) {
      log.debug({ workspaceId }, '[instagram/me] no Instagram connection found')
      return NextResponse.json({ 
        ok: false, 
        error: 'NOT_CONNECTED'
      }, { status: 404 })
    }

    // Fetch profile information
    try {
      const profile = await getUserProfile(socialAccount.accessToken, socialAccount.externalId)
      
      log.info({ 
        workspaceId, 
        instagramId: profile.id,
        username: profile.username 
      }, '[instagram/me] profile fetched successfully')

      const response = NextResponse.json({
        ok: true,
        data: profile
      })

      // Add 60s cache control
      response.headers.set('Cache-Control', 'private, max-age=60')

      return response
    } catch (error) {
      log.error({ error, workspaceId }, '[instagram/me] failed to fetch profile')
      return NextResponse.json({ 
        ok: false, 
        error: 'PROFILE_FETCH_FAILED' 
      }, { status: 500 })
    }

  } catch (err) {
    log.error({ err }, '[instagram/me] unhandled error')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
