import { NextRequest, NextResponse } from 'next/server';
import { getProviders } from '@/services/providers';
import { createTrace, logAIEvent, createAIEvent } from '@/lib/observability';
import { emitEvent } from '@/server/events/bus';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { env } from '@/lib/env';
import { log } from '@/lib/logger';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  // Create trace for this API request
  const trace = createTrace();
  
  try {
    // Enforce auth - return JSON error instead of redirect
    const { workspaceId: authWorkspaceId } = await requireSessionOrDemo(request);
    
    const body = await request.json();
    const { workspaceId, socialAccounts = [], provider } = body;

    // Use authenticated workspace ID if not provided in body
    const effectiveWorkspaceId = workspaceId || authWorkspaceId;

    if (!effectiveWorkspaceId) {
      return NextResponse.json(
        { ok: false, error: 'NO_WORKSPACE' },
        { status: 400 }
      );
    }

    // Create a job ID for tracking
    const jobId = nanoid();

    // Log audit run start
    log.info({ 
      route: 'audit/run', 
      inline: env.AUDIT_INLINE, 
      provider, 
      jobId 
    }, 'audit run start');

    // Branch based on AUDIT_INLINE flag
    if (env.AUDIT_INLINE) {
      // INLINE MODE: Process audit synchronously
      try {
        // Emit audit progress event
        emitEvent({
          kind: 'audit.progress',
          workspaceId: effectiveWorkspaceId,
          step: 'started',
          status: 'running',
          pct: 0,
          traceId: trace.traceId,
          jobId
        });

        // Get providers with feature flag gating
        const providers = getProviders(effectiveWorkspaceId);
        
        // Run audit synchronously
        const auditResult = await providers.audit(effectiveWorkspaceId, socialAccounts);

        // Emit audit completion event
        emitEvent({
          kind: 'audit.progress',
          workspaceId: effectiveWorkspaceId,
          step: 'completed',
          status: 'done',
          pct: 100,
          traceId: trace.traceId,
          jobId
        });

        // Log audit run end
        log.info({ 
          route: 'audit/run', 
          inline: env.AUDIT_INLINE, 
          provider, 
          jobId, 
          auditId: auditResult.auditId 
        }, 'audit run end');

        // Log the successful API completion
        const apiEvent = createAIEvent(
          trace,
          'audit_api',
          'audit_run_success',
          undefined,
          { 
            workspaceId: effectiveWorkspaceId, 
            socialAccountsCount: socialAccounts.length,
            hasResult: !!auditResult,
            inline: true,
            jobId,
            auditId: auditResult.auditId
          }
        );
        logAIEvent(apiEvent);

        // Return immediate response with both jobId and auditId
        return NextResponse.json({
          ok: true,
          jobId,
          auditId: auditResult.auditId
        });

      } catch (error) {
        // Log inline audit failure
        const errorMessage = error instanceof Error ? error.message : 
                           (error as any)?.message || (error as any)?.toString?.() || 'Unknown error';

        log.error({ 
          route: 'audit/run', 
          inline: env.AUDIT_INLINE, 
          provider, 
          jobId, 
          error: errorMessage 
        }, 'audit run failed');

        const errorEvent = createAIEvent(
          trace,
          'audit_api',
          'audit_run_failure',
          undefined,
          { 
            workspaceId: effectiveWorkspaceId, 
            error: errorMessage,
            socialAccountsCount: socialAccounts.length,
            inline: true,
            jobId
          }
        );
        logAIEvent(errorEvent);

        return NextResponse.json(
          { ok: false, error: 'INTERNAL_ERROR' },
          { status: 500 }
        );
      }
    } else {
      // QUEUE MODE: Enqueue and return job ID (existing behavior)
      // Emit audit progress event
      emitEvent({
        kind: 'audit.progress',
        workspaceId: effectiveWorkspaceId,
        step: 'started',
        status: 'running',
        pct: 0,
        traceId: trace.traceId,
        jobId
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
        traceId: trace.traceId,
        jobId
      });
      
      const auditResult = await providers.audit(effectiveWorkspaceId, socialAccounts);
      
      // Emit audit completion event
      emitEvent({
        kind: 'audit.progress',
        workspaceId: effectiveWorkspaceId,
        step: 'completed',
        status: 'done',
        pct: 100,
        traceId: trace.traceId,
        jobId
      });

      // Log audit run end
      log.info({ 
        route: 'audit/run', 
        inline: env.AUDIT_INLINE, 
        provider, 
        jobId,
        auditId: auditResult.auditId 
      }, 'audit run end');
      
      // Log the successful API completion
      const apiEvent = createAIEvent(
        trace,
        'audit_api',
        'audit_run_success',
        undefined,
        { 
          workspaceId: effectiveWorkspaceId, 
          socialAccountsCount: socialAccounts.length,
          hasResult: !!auditResult,
          inline: false,
          jobId
        }
      );
      logAIEvent(apiEvent);
      
      // Return job ID for queue mode
      return NextResponse.json({ 
        ok: true,
        jobId
      });
    }
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
    
    const jobId = 'unknown';
    
    // Emit audit error event
    emitEvent({
      kind: 'audit.progress',
      workspaceId: body?.workspaceId || 'unknown',
      step: 'error',
      status: 'error',
      traceId: trace.traceId,
      jobId
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
        socialAccountsCount: body?.socialAccounts?.length || 0,
        jobId
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

// Return 405 for non-POST methods
export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}
