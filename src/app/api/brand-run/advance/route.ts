import { NextResponse } from 'next/server'
import { ensureWorkspace } from '@/lib/workspace'

/** Minimal state advance — actual heavy lifting stays in existing services */
import { env } from "@/lib/env"

export async function POST(req: Request){
  // Validate APP_URL is set
  const APP_URL = env.APP_URL
  if (!APP_URL) {
    return NextResponse.json({
      ok: false,
      error: "APP_URL_MISSING",
      message: "Set APP_URL or NEXT_PUBLIC_APP_URL"
    }, { status: 500 })
  }

  const ws = await ensureWorkspace()
  const body = await req.json().catch(()=> ({}))
  const target = body?.step as string | undefined

  // Let your existing /upsert update the step; we keep orchestration tiny.
  // If target provided, set to that; else auto-advance by one.
  try{
    // fetch current
    const cur = await fetch(`${APP_URL}/api/brand-run/current`, { cache:'no-store' }).then(r=>r.json()).catch(()=>null)
    const curStep = cur?.data?.step || cur?.step || 'CONNECT'
    const ORDER = ['CONNECT','AUDIT','MATCHES','APPROVE','PACK','CONTACTS','OUTREACH','COMPLETE']
    const next = target ?? ORDER[Math.min(ORDER.indexOf(curStep)+1, ORDER.length-1)]
    const up = await fetch(`${APP_URL}/api/brand-run/upsert`, {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ workspaceId: ws, step: next })
    }).then(r=>r.json()).catch(()=>null)
    return NextResponse.json({ ok:true, data: up?.data ?? up ?? { step: next, workspaceId: ws } })
  }catch(e:any){
    return NextResponse.json({ ok:false, error:e?.message || 'advance_failed' }, { status:500 })
  }
}
