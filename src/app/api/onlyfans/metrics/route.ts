import { NextResponse } from 'next/server'
import { loadOfConnection } from '@/services/onlyfans/store'
import { resolveOfVendor, vendorFetchMetrics } from '@/services/onlyfans/client'
import { currentWorkspaceId } from '@/lib/currentWorkspace'

export async function GET(){
  const wsid = await currentWorkspaceId()
  if (!wsid) return NextResponse.json({ ok:false, error:'no_workspace' }, { status:401 })
  const conn = await loadOfConnection(wsid)
  if (!conn) return NextResponse.json({ ok:false, error:'not_connected' }, { status:404 })

  const vendor = resolveOfVendor()
  if (conn.provider === 'manual' || vendor === 'manual'){
    // In a full build, retrieve last manual metrics snapshot from DB; here return an empty but valid shape.
    return NextResponse.json({ ok:true, data: { 
      audience:{ subs:0, churnRate:0, topGeo:[] }, 
      performance:{ revenueLast30:0, avgLikes:0, avgComments:0, avgMessages:0 },
      contentSignals:[]
    } })
  }

  if (!conn.accessToken) return NextResponse.json({ ok:false, error:'no_token' }, { status:400 })
  const res = await vendorFetchMetrics(conn.accessToken, vendor!)
  if (!res.ok) return NextResponse.json({ ok:false, error:res.error }, { status:502 })
  return NextResponse.json(res)
}
