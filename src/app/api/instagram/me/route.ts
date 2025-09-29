import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { getInstagramAccount, fetchProfile } from '@/services/instagram/graph'

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

    // Get Instagram account for current workspace
    const account = await getInstagramAccount()
    if (!account) {
      log.debug({ workspaceId }, '[instagram/me] no Instagram connection found')
      return NextResponse.json({ 
        ok: false, 
        connected: false,
        error: 'NOT_CONNECTED'
      })
    }

    // Fetch profile information
    try {
      const profile = await fetchProfile(account.igUserId, account.token)
      
      log.info({ 
        workspaceId, 
        igUserId: account.igUserId,
        username: profile.username 
      }, '[instagram/me] profile fetched successfully')

      return NextResponse.json({
        ok: true,
        connected: true,
        profile
      })
    } catch (error) {
      log.error({ error, workspaceId, igUserId: account.igUserId }, '[instagram/me] failed to fetch profile')
      return NextResponse.json({ 
        ok: false, 
        connected: true,
        error: 'PROFILE_FETCH_FAILED' 
      }, { status: 500 })
    }

  } catch (err) {
    log.error({ err }, '[instagram/me] unhandled error')
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
