import { NextResponse, type NextRequest } from 'next/server'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { env } from "@/lib/env"

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Starts a brand run if 'idle' or none exists, otherwise no-ops.
 * Delegates to existing routes so we don't duplicate business logic.
 */

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await requireSessionOrDemo(req);

    // Validate APP_URL is set
    const APP_URL = env.APP_URL
    if (!APP_URL) {
      return NextResponse.json({
        ok: false,
        error: "APP_URL_MISSING",
        message: "Set APP_URL or NEXT_PUBLIC_APP_URL"
      }, { status: 500 })
    }

    // 1) Check current run
    const cur = await fetch(`${APP_URL}/api/brand-run/current`, { cache:'no-store' })
    const curJson = await cur.json().catch(()=> ({}))
    const status = curJson?.data?.step ?? curJson?.step ?? 'idle'

    // 2) If idle/none, create or upsert
    if (!status || status === 'idle'){
      await fetch(`${APP_URL}/api/brand-run/upsert`, {
        method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ auto: false })
      })
    }

    // 3) Always send the user to the workflow page
    return NextResponse.json({ ok:true, redirect:'/brand-run' })
  } catch (e:any){
    console.error('Brand run start error:', e);
    return NextResponse.json({ ok:false, error: e?.message || 'start_failed' }, { status:500 })
  }
}
