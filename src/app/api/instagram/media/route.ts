import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { getInstagramAccount, fetchMedia } from '@/services/instagram/graph'

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

    // Get Instagram account for current workspace
    const account = await getInstagramAccount()
    if (!account) {
      log.debug({ workspaceId }, '[instagram/media] no Instagram connection found')
      return NextResponse.json({ 
        ok: false, 
        connected: false,
        error: 'NOT_CONNECTED'
      })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '25')
    const after = url.searchParams.get('after') || undefined

    // Fetch media
    try {
      const result = await fetchMedia(account.igUserId, account.token, { limit, after })
      
      log.info({ 
        workspaceId, 
        igUserId: account.igUserId,
        limit,
        hasAfter: !!after,
        mediaCount: result.data.length
      }, '[instagram/media] media fetched successfully')

      return NextResponse.json({
        ok: true,
        data: result.data,
        paging: result.paging
      })
    } catch (error) {
      log.error({ error, workspaceId, igUserId: account.igUserId }, '[instagram/media] failed to fetch media')
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
