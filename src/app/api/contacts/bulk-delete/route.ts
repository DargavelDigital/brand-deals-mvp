import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.workspaceId) {
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
        workspaceId: session.user.workspaceId,
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

