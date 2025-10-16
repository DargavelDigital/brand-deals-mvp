import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { db } from '@/lib/prisma'
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
    console.log('⏭️ [ADVANCE] Step 1 - API called');
    
    // Get session (EXACT pattern from agency/list)
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      console.error('❌ [ADVANCE] No session found');
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }
    
    console.log('✅ [ADVANCE] Session found for:', session.user.email);
    
    // Get workspaceId from membership (EXACT pattern from agency/list)
    const membership = await db().membership.findFirst({
      where: { 
        userId: session.user.id,
        role: { in: ['OWNER', 'MANAGER', 'MEMBER'] }
      },
      select: { workspaceId: true },
      orderBy: { createdAt: 'asc' }
    });
    
    if (!membership) {
      console.error('❌ [ADVANCE] No workspace membership found');
      return NextResponse.json({ ok: false, error: 'NO_WORKSPACE' }, { status: 404 });
    }
    
    const workspaceId = membership.workspaceId;
    console.log('✅ [ADVANCE] Resolved workspaceId:', workspaceId);
    
    const body = await req.json();
    
    console.log('⏭️ Advance request:', { workspaceId, body });
    
    // Determine next step based on current workflow
    // CORRECT ORDER: AUDIT → MATCHES → CONTACTS → PACK → OUTREACH → COMPLETE
    const stepMap: Record<string, string> = {
      'AUDIT': 'MATCHES',
      'MATCHES': 'CONTACTS',    // Fixed: Contacts comes after matches
      'CONTACTS': 'PACK',        // Fixed: Pack comes after contacts
      'PACK': 'OUTREACH',        // Fixed: Outreach comes after pack
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
