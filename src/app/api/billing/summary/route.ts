export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSessionAndWorkspace } from '@/lib/billing/workspace';

export async function GET() {
  try {
    const { ws } = await getSessionAndWorkspace();
    return NextResponse.json({ 
      ok: true, 
      plan: ws.plan,
      workspaceId: ws.id 
    });
  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      error: e?.message ?? 'SUMMARY_FAILED' 
    }, { status: 200 });
  }
}