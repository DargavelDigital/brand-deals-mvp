import { NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const workspaceId = await requireSessionOrDemo(req as any);
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ ok: false, error: 'INVALID_IDS' }, { status: 400 });
    }

    // Soft delete contacts by setting status to ARCHIVED
    const result = await prisma.contact.updateMany({
      where: {
        id: { in: ids },
        workspaceId: workspaceId,
      },
      data: {
        status: 'ARCHIVED',
      },
    });

    return NextResponse.json({ 
      ok: true, 
      message: `Archived ${result.count} contact${result.count !== 1 ? 's' : ''}`,
      count: result.count 
    });
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || 'BULK_DELETE_FAILED' 
    }, { status: 500 });
  }
}

