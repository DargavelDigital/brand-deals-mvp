import { NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { deleteLinkedInConnection } from '@/services/linkedin/store'

async function POST_impl(){
  const wsid = await currentWorkspaceId()
  if (!wsid) return NextResponse.json({ ok:false, error:'no_workspace' }, { status:401 })
  await deleteLinkedInConnection(wsid)
  return NextResponse.json({ ok:true })
}

export const POST = withIdempotency(POST_impl);
