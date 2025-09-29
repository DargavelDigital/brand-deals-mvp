import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { getInstagramAccount, fetchComments } from '@/services/instagram/graph'

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
      log.warn({ e }, '[instagram/media/comments] failed to get workspace ID')
      return NextResponse.json({ ok: false, error: 'NOT_AUTHENTICATED' }, { status: 401 })
    }

    // Get Instagram account for current workspace
    const account = await getInstagramAccount()
    if (!account) {
      log.debug({ workspaceId }, '[instagram/media/comments] no Instagram connection found')
      return NextResponse.json({ 
        ok: false, 
        connected: false,
        error: 'NOT_CONNECTED'
      })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const after = url.searchParams.get('after') || undefined
    const mediaId = params.id

    if (!mediaId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'MISSING_MEDIA_ID' 
      }, { status: 400 })
    }

    // Fetch comments
    try {
      const result = await fetchComments(mediaId, account.token, { limit, after })
      
      log.info({ 
        workspaceId, 
        igUserId: account.igUserId,
        mediaId,
        limit,
        hasAfter: !!after,
        commentsCount: result.data.length
      }, '[instagram/media/comments] comments fetched successfully')

      return NextResponse.json({
        ok: true,
        data: result.data,
        paging: result.paging
      })
    } catch (error) {
      log.error({ error, workspaceId, mediaId }, '[instagram/media/comments] failed to fetch comments')
      return NextResponse.json({ 
        ok: false, 
        error: 'COMMENTS_FETCH_FAILED' 
      }, { status: 500 })
    }

  } catch (err) {
    log.error({ err }, '[instagram/media/comments] unhandled error')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
