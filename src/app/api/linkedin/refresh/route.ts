import { NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { loadLinkedInConnection, saveLinkedInConnection } from '@/services/linkedin/store'
import { refreshAccessToken } from '@/services/linkedin/api'

async function POST_impl(){
  const wsid = await currentWorkspaceId()
  if (!wsid) return NextResponse.json({ ok:false, error:'no_workspace' }, { status:401 })
  const conn = await loadLinkedInConnection(wsid)
  if (!conn?.refreshToken) return NextResponse.json({ ok:false, error:'not_connected' }, { status:404 })
  try {
    const next = await refreshAccessToken(conn.refreshToken)
    await saveLinkedInConnection({
      ...conn,
      accessToken: next.access_token,
      refreshToken: next.refresh_token || conn.refreshToken,
      expiresAt: next.expires_in ? new Date(Date.now()+next.expires_in*1000).toISOString() : conn.expiresAt
    })
    return NextResponse.json({ ok:true })
  } catch (e:any){
    return NextResponse.json({ ok:false, error:e?.message || 'refresh_failed' }, { status:500 })
  }
}

export const POST = withIdempotency(POST_impl);
