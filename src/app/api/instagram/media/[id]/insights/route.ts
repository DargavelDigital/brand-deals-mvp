import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { getInstagramAccount, fetchMediaInsights } from '@/services/instagram/graph'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get current workspace ID
    let workspaceId: string
    try {
      const { workspaceId: wsid } = await requireSessionOrDemo(req)
      workspaceId = wsid
    } catch (e) {
      log.warn({ e }, '[instagram/media/insights] failed to get workspace ID')
      return NextResponse.json({ ok: false, error: 'NOT_AUTHENTICATED' }, { status: 401 })
    }

    // Get Instagram account for current workspace
    const account = await getInstagramAccount()
    if (!account) {
      log.debug({ workspaceId }, '[instagram/media/insights] no Instagram connection found')
      return NextResponse.json({ 
        ok: false, 
        connected: false,
        error: 'NOT_CONNECTED'
      })
    }

    const mediaId = params.id
    if (!mediaId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'MISSING_MEDIA_ID' 
      }, { status: 400 })
    }

    // Fetch media insights
    try {
      const result = await fetchMediaInsights(mediaId, account.token)
      
      log.info({ 
        workspaceId, 
        igUserId: account.igUserId,
        mediaId,
        metricsCount: result.data.length
      }, '[instagram/media/insights] media insights fetched successfully')

      return NextResponse.json({
        ok: true,
        metrics: result.data
      })
    } catch (error) {
      log.error({ error, workspaceId, mediaId }, '[instagram/media/insights] failed to fetch media insights')
      return NextResponse.json({ 
        ok: false, 
        error: 'INSIGHTS_FETCH_FAILED' 
      }, { status: 500 })
    }

  } catch (err) {
    log.error({ err }, '[instagram/media/insights] unhandled error')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
