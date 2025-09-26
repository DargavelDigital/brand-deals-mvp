import { NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { loadIgConnection, saveIgConnection } from '@/services/instagram/store'
import { exchangeLongLivedToken } from '@/services/instagram/graph'

export const POST = withIdempotency(async () => {
  const wsid = await currentWorkspaceId()
  if (!wsid) return NextResponse.json({ ok: false, error: 'no_workspace' }, { status: 401 })
  const conn = await loadIgConnection(wsid)
  if (!conn) return NextResponse.json({ ok: false, error: 'not_connected' }, { status: 404 })
  try {
    const next = await exchangeLongLivedToken(conn.userAccessToken)
    await saveIgConnection({ ...conn, userAccessToken: next.access_token, expiresAt: new Date(Date.now() + (next.expires_in ?? 0)*1000).toISOString() })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e?.message || 'refresh_failed' }, { status: 500 })
  }
});
