import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/http/envelope';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { id: dealId } = await params
    const { nextStep } = await request.json();
    
    if (typeof nextStep !== 'string') {
      return NextResponse.json(fail('INVALID_NEXT_STEP'), { status: 400 });
    }

    // Verify deal exists and user has access to workspace
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { workspace: true }
    });

    if (!deal) {
      return NextResponse.json(fail('DEAL_NOT_FOUND'), { status: 404 });
    }

    // Check workspace ownership
    const membership = await prisma.membership.findFirst({
      where: {
        userId: (session.user as any).id,
        workspaceId: deal.workspaceId
      }
    });

    if (!membership) {
      return NextResponse.json(fail('UNAUTHORIZED_ACCESS'), { status: 403 });
    }

    // Update the deal's nextStep field
    const updatedDeal = await prisma.deal.update({
      where: { id: dealId },
      data: { nextStep }
    });

    return NextResponse.json(ok(updatedDeal));
  } catch (error) {
    console.error('Error updating deal next step:', error);
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 });
  }
}
