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
    // requireSessionOrDemo returns an object { session, demo, workspaceId }
    const auth = await requireSessionOrDemo(req);
    const workspaceId = auth?.workspaceId || (typeof auth === 'string' ? auth : null);
    
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    console.log('🚀 Starting brand run for workspace:', workspaceId);

    // Build internal API URL with fallback (no hard requirement)
    const baseUrl = env.APP_URL || 
                    env.NEXTAUTH_URL || 
                    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    console.log('🔍 Using base URL:', baseUrl);

    // 1) Check current run
    const cur = await fetch(`${baseUrl}/api/brand-run/current`, { 
      cache: 'no-store',
      headers: {
        'Cookie': req.headers.get('Cookie') || ''
      }
    })
    const curJson = await cur.json().catch(() => ({}))
    const status = curJson?.data?.step ?? curJson?.step ?? 'idle'

    console.log('📊 Current run status:', status);

    // 2) If idle/none, create or upsert
    if (!status || status === 'idle') {
      console.log('📝 Creating new brand run...');
      await fetch(`${baseUrl}/api/brand-run/upsert`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('Cookie') || ''
        },
        body: JSON.stringify({ 
          workspaceId,
          auto: false 
        })
      })
      console.log('✅ Brand run created');
    }

    // 3) Always send the user to the workflow page
    return NextResponse.json({ ok: true, redirect: '/brand-run' })
  } catch (e: any) {
    console.error('❌ Brand run start error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'start_failed' }, { status: 500 })
  }
}
