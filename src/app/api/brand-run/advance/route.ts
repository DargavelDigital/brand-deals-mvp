import { NextResponse, type NextRequest } from 'next/server'
import { ensureWorkspace } from '@/lib/workspace'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { env } from "@/lib/env"

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Advances a brand run to the next step.
 * Delegates to existing routes so we don't duplicate business logic.
 */

export async function POST(req: NextRequest) {
  // Validate APP_URL is set
  const APP_URL = env.APP_URL
  if (!APP_URL) {
    return NextResponse.json({
      ok: false,
      error: "APP_URL_MISSING",
      message: "Set APP_URL or NEXT_PUBLIC_APP_URL"
    }, { status: 500 })
  }

  try {
    const workspaceId = await requireSessionOrDemo(req);
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }
    const body = await req.json();
    const { step, auto = false } = body;

    if (!step) {
      return NextResponse.json({ ok: false, error: 'MISSING_STEP' }, { status: 400 });
    }

    // Call the upsert endpoint to advance the run
    const response = await fetch(`${APP_URL}/api/brand-run/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, auto })
    });

    if (!response.ok) {
      throw new Error(`Failed to advance brand run: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'advance_failed' }, { status: 500 });
  }
}
