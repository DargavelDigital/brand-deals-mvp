import { NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { deleteIgConnection } from '@/services/instagram/store'

export const POST = withIdempotency(async () => {
  const wsid = await currentWorkspaceId()
  if (!wsid) return NextResponse.json({ ok: false, error: 'no_workspace' }, { status: 401 })
  await deleteIgConnection(wsid)
  return NextResponse.json({ ok: true })
});
