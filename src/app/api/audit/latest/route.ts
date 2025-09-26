import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Resolve workspace using server helper - same as run and status routes
    const { workspaceId } = await requireSessionOrDemo(request);
    
    if (!workspaceId) {
      return NextResponse.json(
        { ok: false, error: 'NO_WORKSPACE' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const isDiag = searchParams.get('diag') === '1';
    
    log.info({ 
      route: '/api/audit/latest', 
      workspaceId,
      provider,
      diag: isDiag
    }, 'audit route');

    // Build where clause with optional provider filter
    const whereClause: any = { workspaceId };
    if (provider) {
      whereClause.snapshotJson = {
        path: ['provider'],
        equals: provider
      };
    }

    // Query Audit table directly
    const latestAudit = await prisma.audit.findFirst({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // Get count for diag
    let count = 0;
    if (isDiag) {
      count = await prisma.audit.count({
        where: whereClause
      });
    }

    const response: any = {
      ok: true,
      audit: latestAudit
    };

    if (isDiag) {
      response.workspaceId = workspaceId;
      response.provider = provider;
      response.count = count;
    }
    
    return NextResponse.json(response);
  } catch (error: any) {
    log.error({ error }, 'Error getting latest audit');
    
    // Handle auth errors specifically
    if (error.message === 'UNAUTHENTICATED') {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// Return 405 for non-GET methods
export const POST = withIdempotency(async () => {
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export const PUT = withIdempotency(async () => {
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export const DELETE = withIdempotency(async () => {
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}
