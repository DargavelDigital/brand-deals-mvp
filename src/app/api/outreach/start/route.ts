import { NextResponse } from 'next/server'

export async function POST(req: Request){
  const body = await req.json().catch(()=>null)
  if(!body || !body.contactIds?.length || !body.sequence?.steps?.length){
    return NextResponse.json({ error:'Missing contacts or steps' }, { status:400 })
  }
  // Simulate enqueue
  const enqueued = body.contactIds.length * body.sequence.steps.length
  return NextResponse.json({ ok:true, enqueued })
}
