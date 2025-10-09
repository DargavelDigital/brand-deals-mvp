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
  try {
    // requireSessionOrDemo returns an object { session, demo, workspaceId }
    const auth = await requireSessionOrDemo(req);
    const workspaceId = auth?.workspaceId || (typeof auth === 'string' ? auth : null);
    
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }
    
    const body = await req.json();
    
    console.log('⏭️ Advance request:', { workspaceId, body });
    
    // Determine next step based on current workflow
    const stepMap: Record<string, string> = {
      'AUDIT': 'MATCHES',
      'MATCHES': 'APPROVE',
      'APPROVE': 'PACK',
      'PACK': 'CONTACTS',
      'CONTACTS': 'OUTREACH',
      'OUTREACH': 'COMPLETE'
    };
    
    // Get the current step from body or derive from workflow
    let nextStep = body.step;
    
    if (!nextStep && body.currentStep) {
      nextStep = stepMap[body.currentStep] || 'MATCHES';
    }
    
    // Default to MATCHES if no step provided
    nextStep = nextStep || 'MATCHES';
    
    console.log('⏭️ Advancing workflow:', { workspaceId, nextStep });
    
    // Build internal API URL with fallback
    const baseUrl = env.APP_URL || 
                    (env.NEXTAUTH_URL) || 
                    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    // Call the upsert endpoint to advance the run
    const response = await fetch(`${baseUrl}/api/brand-run/upsert`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('Cookie') || '' // Forward cookies
      },
      body: JSON.stringify({ 
        workspaceId,
        step: nextStep, 
        auto: body.auto || false 
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Advance failed:', response.status, errorData);
      throw new Error(errorData.error || `Failed to advance brand run: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('✅ Workflow advanced to:', nextStep);
    
    return NextResponse.json({ 
      ok: true, 
      nextStep,
      redirectUrl: `/tools/${nextStep.toLowerCase()}`,
      ...result 
    });
  } catch (e: any) {
    console.error('❌ Advance error:', e);
    return NextResponse.json({ 
      ok: false, 
      error: e?.message || 'advance_failed' 
    }, { status: 500 });
  }
}
