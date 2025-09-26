import { NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { loadXConnection, saveXConnection } from '@/services/x/store'
import { refreshToken } from '@/services/x/api'

export async function POST(){
  const wsid = await currentWorkspaceId()
  if (!wsid) return NextResponse.json({ ok:false, error:'no_workspace' }, { status:401 })
  const conn = await loadXConnection(wsid)
  if (!conn?.refreshToken) return NextResponse.json({ ok:false, error:'not_connected' }, { status:404 })
  try {
    const next = await refreshToken(conn.refreshToken)
    await saveXConnection({
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
