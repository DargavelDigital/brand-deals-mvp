import { NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { deleteXConnection } from '@/services/x/store'
import { socials, COMING_SOON_MSG } from '@/config/socials'

function comingSoon() {
  return NextResponse.json({ ok: false, code: 'COMING_SOON', message: COMING_SOON_MSG }, { status: 501 })
}

async function POST_impl() {
  if (!socials.enabled('x')) return comingSoon()
  
  const wsid = await currentWorkspaceId()
  if (!wsid) return NextResponse.json({ ok:false, error:'no_workspace' }, { status:401 })
  await deleteXConnection(wsid)
  return NextResponse.json({ ok:true })
}

export const POST = withIdempotency(POST_impl);
