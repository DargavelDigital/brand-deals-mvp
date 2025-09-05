import { NextRequest, NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Resolve workspace using server helper - same as other audit routes
    const { workspaceId } = await requireSessionOrDemo(request);
    
    if (!workspaceId) {
      return NextResponse.json(
        { ok: false, error: 'NO_WORKSPACE' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const isDiag = searchParams.get('diag') === '1';

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'MISSING_AUDIT_ID' },
        { status: 400 }
      );
    }

    // Log audit get
    log.info({ 
      route: '/api/audit/get', 
      workspaceId,
      auditId: id,
      diag: isDiag
    }, 'audit route');

    // Get audit by ID with workspace security check
    const audit = await prisma.audit.findFirst({
      where: { 
        id,
        workspaceId // Security: ensure user can only access their workspace's audits
      }
    });

    if (!audit) {
      return NextResponse.json(
        { ok: false, error: 'AUDIT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const response: any = {
      ok: true,
      audit
    };

    if (isDiag) {
      response.workspaceId = workspaceId;
      response.auditId = id;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    log.error({ error }, 'Error getting audit');
    
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
export async function POST() {
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
