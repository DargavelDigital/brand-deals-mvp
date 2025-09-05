import { NextRequest, NextResponse } from 'next/server';
import { getProviders } from '@/services/providers';
import { createTrace, logAIEvent, createAIEvent } from '@/lib/observability';
import { emitEvent } from '@/server/events/bus';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { env } from '@/lib/env';
import { log } from '@/lib/logger';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';
import { AuditStatus } from '@/types/audit';

export async function POST(request: NextRequest) {
  // Create trace for this API request
  const trace = createTrace();
  
  try {
    // Resolve workspace using server helper - ignore wsid cookie unless helper fails
    const { workspaceId: effectiveWorkspaceId } = await requireSessionOrDemo(request);
    
    if (!effectiveWorkspaceId) {
      return NextResponse.json(
        { ok: false, error: 'NO_WORKSPACE' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { socialAccounts = [], provider = 'tiktok' } = body;

    // Create a job ID for tracking
    const jobId = nanoid();
    const auditId = nanoid();

    // Check for diag parameter
    const { searchParams } = new URL(request.url);
    const isDiag = searchParams.get('diag') === '1';

    // Log audit run start
    log.info({ 
      route: '/api/audit/run', 
      workspaceId: effectiveWorkspaceId,
      provider, 
      jobId,
      diag: isDiag,
      status: 'queued'
    }, 'audit route');

    // UPSERT Audit row - create with status "queued"
    // Store jobId and status in snapshotJson as metadata since schema doesn't have these fields
    await prisma.audit.upsert({
      where: { id: auditId },
      create: {
        id: auditId,
        workspaceId: effectiveWorkspaceId,
        sources: socialAccounts,
        snapshotJson: {
          jobId,
          status: 'queued' as AuditStatus,
          provider,
          metadata: {
            createdAt: new Date().toISOString(),
            socialAccounts
          }
        }
      },
      update: {
        sources: socialAccounts,
        snapshotJson: {
          jobId,
          status: 'queued' as AuditStatus,
          provider,
          metadata: {
            createdAt: new Date().toISOString(),
            socialAccounts
          }
        }
      }
    });

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

        // Update Audit row to succeeded status
        await prisma.audit.update({
          where: { id: auditId },
          data: {
            snapshotJson: {
              jobId,
              status: 'succeeded' as AuditStatus,
              provider,
              metadata: {
                createdAt: new Date().toISOString(),
                socialAccounts,
                completedAt: new Date().toISOString(),
                auditResult
              }
            }
          }
        });

        // Return immediate response with both jobId and auditId
        const response: any = {
          ok: true,
          jobId,
          auditId: auditResult.auditId || auditId
        };

        if (isDiag) {
          response.workspaceId = effectiveWorkspaceId;
          response.provider = provider;
        }

        return NextResponse.json(response);

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

        // Update Audit row to failed status
        await prisma.audit.update({
          where: { id: auditId },
          data: {
            snapshotJson: {
              jobId,
              status: 'failed' as AuditStatus,
              provider,
              metadata: {
                createdAt: new Date().toISOString(),
                socialAccounts,
                failedAt: new Date().toISOString(),
                error: errorMessage
              }
            }
          }
        });

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
      
      // Update Audit row to running status
      await prisma.audit.update({
        where: { id: auditId },
        data: {
          snapshotJson: {
            jobId,
            status: 'running' as AuditStatus,
            provider,
            metadata: {
              createdAt: new Date().toISOString(),
              socialAccounts,
              startedAt: new Date().toISOString()
            }
          }
        }
      });

      // Return job ID for queue mode
      const response: any = { 
        ok: true,
        jobId
      };

      if (isDiag) {
        response.workspaceId = effectiveWorkspaceId;
        response.provider = provider;
      }

      return NextResponse.json(response);
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

/*
TEST PLAN (leave as a comment at bottom of run route file)
Browser console (while signed-in or demo mode):
document.cookie = "wsid=; Max-Age=0; Path=/; SameSite=Lax; Secure"; // prevent cookie drift

// Run
const run = await fetch('/api/audit/run', {
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body: JSON.stringify({ provider:'tiktok' })
}).then(r=>r.json());
console.log(run);

// Poll
async function poll(jobId, tries=5){ for(let i=0;i<tries;i++){ const x=await fetch('/api/audit/status?jobId='+jobId).then(r=>r.json()); console.log('status',i+1,x); await new Promise(r=>setTimeout(r,1000)); } }
await poll(run.jobId);

// Latest (provider-scoped)
const latest = await fetch('/api/audit/latest?provider=tiktok').then(r=>r.json());
console.log('latest', latest);

// Detail
if (latest?.audit?.id) {
  const detail = await fetch('/api/audit/get?id='+latest.audit.id).then(r=>r.json());
  console.log('detail', detail);
}

// Diags
await fetch('/api/audit/run?diag=1',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(r=>r.json());
await fetch('/api/audit/status?jobId='+run.jobId+'&diag=1').then(r=>r.json());
await fetch('/api/audit/latest?provider=tiktok&diag=1').then(r=>r.json());
*/
