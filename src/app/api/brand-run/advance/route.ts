import { NextResponse } from 'next/server'
import { ensureWorkspace } from '@/lib/workspace'
import { requireAuth } from '@/lib/auth/requireAuth'
import { env } from "@/lib/env"

/**
 * Advances a brand run to the next step.
 * Delegates to existing routes so we don't duplicate business logic.
 */

export async function POST(req: Request) {
  // Validate APP_URL is set
  const APP_URL = env.APP_URL
  if (!APP_URL) {
    return NextResponse.json({
      ok: false,
      error: "APP_URL_MISSING",
      message: "Set APP_URL or NEXT_PUBLIC_APP_URL"
    }, { status: 500 })
  }

  // Use requireAuth helper
  await requireAuth()

  try {
    const workspaceId = await ensureWorkspace();
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
