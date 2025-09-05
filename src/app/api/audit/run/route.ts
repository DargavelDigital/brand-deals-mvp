import { NextRequest, NextResponse } from 'next/server';
import { getProviders } from '@/services/providers';
import { createTrace, logAIEvent, createAIEvent } from '@/lib/observability';
import { emitEvent } from '@/server/events/bus';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';

export async function POST(request: NextRequest) {
  // Create trace for this API request
  const trace = createTrace();
  
  try {
    // Enforce auth - return JSON error instead of redirect
    const { workspaceId: authWorkspaceId } = await requireSessionOrDemo(request);
    
    const body = await request.json();
    const { workspaceId, socialAccounts = [] } = body;

    // Use authenticated workspace ID if not provided in body
    const effectiveWorkspaceId = workspaceId || authWorkspaceId;

    if (!effectiveWorkspaceId) {
      return NextResponse.json(
        { ok: false, error: 'NO_WORKSPACE' },
        { status: 400 }
      );
    }

    // Log the API request start
    console.log(`🔍 Audit API request started with trace: ${trace.traceId}`);
    
    // Emit audit progress event
    emitEvent({
      kind: 'audit.progress',
      workspaceId: effectiveWorkspaceId,
      step: 'started',
      status: 'running',
      pct: 0,
      traceId: trace.traceId
    });
    
    // Get providers with feature flag gating
    const providers = getProviders(effectiveWorkspaceId);
    
    // Emit audit progress event
    emitEvent({
      kind: 'audit.progress',
      workspaceId: effectiveWorkspaceId,
      step: 'running',
      status: 'running',
      pct: 50,
      traceId: trace.traceId
    });
    
    const auditResult = await providers.audit(effectiveWorkspaceId, socialAccounts);
    
    // Emit audit completion event
    emitEvent({
      kind: 'audit.progress',
      workspaceId: effectiveWorkspaceId,
      step: 'completed',
      status: 'done',
      pct: 100,
      traceId: trace.traceId
    });
    
    // Log the successful API completion
    const apiEvent = createAIEvent(
      trace,
      'audit_api',
      'audit_run_success',
      undefined,
      { 
        workspaceId: effectiveWorkspaceId, 
        socialAccountsCount: socialAccounts.length,
        hasResult: !!auditResult
      }
    );
    logAIEvent(apiEvent);
    
    // Add trace ID to response headers for client correlation
    const response = NextResponse.json({ 
      ok: true,
      result: auditResult,
      traceId: trace.traceId 
    });
    response.headers.set('x-trace-id', trace.traceId);
    
    return response;
  } catch (error: any) {
    console.error('Error running audit:', error);
    
    // Handle auth errors specifically
    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }
    
    // Try to get body for error logging, but don't fail if it's not available
    let body: any = {};
    try {
      body = await request.json();
    } catch (parseError) {
      // Body already consumed or invalid JSON
    }
    
    // Emit audit error event
    emitEvent({
      kind: 'audit.progress',
      workspaceId: body?.workspaceId || 'unknown',
      step: 'error',
      status: 'error',
      traceId: trace.traceId
    });
    
    // Log the API failure
    const errorMessage = error instanceof Error ? error.message : 
                        (error?.message || error?.toString?.() || 'Unknown error');
    const errorEvent = createAIEvent(
      trace,
      'audit_api',
      'audit_run_failure',
      undefined,
      { 
        workspaceId: body?.workspaceId, 
        error: errorMessage,
        socialAccountsCount: body?.socialAccounts?.length || 0
      }
    );
    logAIEvent(errorEvent);
    
    // Add trace ID to error response headers
    const errorResponse = NextResponse.json(
      { ok: false, error: 'Failed to run audit', traceId: trace.traceId },
      { status: 500 }
    );
    errorResponse.headers.set('x-trace-id', trace.traceId);
    
    return errorResponse;
  }
}
