import { NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { z } from 'zod'
import { currentWorkspaceId } from '@/lib/currentWorkspace'
import { saveOnlyFansConnection } from '@/services/onlyfans/store'
import { OfMetrics } from '@/services/onlyfans/types'

const Body = z.object({
  metrics: OfMetrics,
  username: z.string().optional()
})

export async function POST(req: Request){
  const wsid = await currentWorkspaceId()
  if (!wsid) return NextResponse.json({ ok:false, error:'no_workspace' }, { status:401 })
  const body = await req.json().catch(()=>null)
  const parsed = Body.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok:false, error:'bad_request' }, { status:400 })

      await saveOnlyFansConnection({
    workspaceId: wsid,
    provider: 'manual',
    username: parsed.data.username || 'OnlyFans (manual)'
  })

  // You can persist the metrics snapshot to your audits table here if desired.
  return NextResponse.json({ ok:true, data: parsed.data.metrics })
}
