import { NextRequest, NextResponse } from 'next/server';
import { getProviders } from '@/services/providers';
import { createTrace, logAIEvent, createAIEvent } from '@/lib/observability';

export async function POST(request: NextRequest) {
  // Create trace for this API request
  const trace = createTrace();
  
  try {
    const body = await request.json();
    const { workspaceId, socialAccounts = [] } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    // Log the API request start
    console.log(`🔍 Audit API request started with trace: ${trace.traceId}`);
    
    // Get providers with feature flag gating
    const providers = getProviders(workspaceId);
    const auditResult = await providers.audit(workspaceId, socialAccounts);
    
    // Log the successful API completion
    const apiEvent = createAIEvent(
      trace,
      'audit_api',
      'audit_run_success',
      undefined,
      { 
        workspaceId, 
        socialAccountsCount: socialAccounts.length,
        hasResult: !!auditResult
      }
    );
    logAIEvent(apiEvent);
    
    // Add trace ID to response headers for client correlation
    const response = NextResponse.json({ 
      result: auditResult,
      traceId: trace.traceId 
    });
    response.headers.set('x-trace-id', trace.traceId);
    
    return response;
  } catch (error: any) {
    console.error('Error running audit:', error);
    
    // Try to get body for error logging, but don't fail if it's not available
    let body: any = {};
    try {
      body = await request.json();
    } catch (parseError) {
      // Body already consumed or invalid JSON
    }
    
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
      { error: 'Failed to run audit', traceId: trace.traceId },
      { status: 500 }
    );
    errorResponse.headers.set('x-trace-id', trace.traceId);
    
    return errorResponse;
  }
}
