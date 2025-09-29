import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { prisma } from '@/lib/prisma'
import { getRecentMedia } from '@/services/instagram/meta'

export async function GET(req: Request) {
  try {
    // Get current workspace ID
    let workspaceId: string
    try {
      const { workspaceId: wsid } = await requireSessionOrDemo(req)
      workspaceId = wsid
    } catch (e) {
      log.warn({ e }, '[instagram/media] failed to get workspace ID')
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
      log.debug({ workspaceId }, '[instagram/media] no Instagram connection found')
      return NextResponse.json({ 
        ok: false, 
        error: 'NOT_CONNECTED'
      }, { status: 404 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '12')

    // Fetch media
    try {
      const media = await getRecentMedia(socialAccount.accessToken, limit)
      
      log.info({ 
        workspaceId, 
        limit,
        mediaCount: media.length
      }, '[instagram/media] media fetched successfully')

      const response = NextResponse.json({
        ok: true,
        data: media
      })

      // Add 30s cache control
      response.headers.set('Cache-Control', 'private, max-age=30')

      return response
    } catch (error) {
      log.error({ error, workspaceId }, '[instagram/media] failed to fetch media')
      return NextResponse.json({ 
        ok: false, 
        error: 'MEDIA_FETCH_FAILED' 
      }, { status: 500 })
    }

  } catch (err) {
    log.error({ err }, '[instagram/media] unhandled error')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
