import { NextResponse } from 'next/server'

/**
 * Starts a brand run if 'idle' or none exists, otherwise no-ops.
 * Delegates to existing routes so we don't duplicate business logic.
 */
export async function POST(){
  // 1) Check current run
  try {
    const cur = await fetch(`${process.env.APP_URL ?? ''}/api/brand-run/current`, { cache:'no-store' })
    const curJson = await cur.json().catch(()=> ({}))
    const status = curJson?.data?.status ?? curJson?.status ?? 'idle'

    // 2) If idle/none, create or upsert
    if (!status || status === 'idle'){
      await fetch(`${process.env.APP_URL ?? ''}/api/brand-run/upsert`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ auto: false })
      })
    }

    // 3) Always send the user to the workflow page
    return NextResponse.json({ ok:true, redirect:'/brand-run' })
  } catch (e:any){
    return NextResponse.json({ ok:false, error: e?.message || 'start_failed' }, { status:500 })
  }
}
