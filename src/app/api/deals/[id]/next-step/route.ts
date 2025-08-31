import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/requireAuth';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/http/envelope';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(['OWNER', 'MANAGER', 'MEMBER']);
    if (!authResult.ok) {
      return NextResponse.json(fail(authResult.error, authResult.status), { status: authResult.status });
    }

    const { nextStep } = await request.json();
    
    if (typeof nextStep !== 'string') {
      return NextResponse.json(fail('INVALID_NEXT_STEP'), { status: 400 });
    }

    // Verify deal exists and user has access to workspace
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: { workspace: true }
    });

    if (!deal) {
      return NextResponse.json(fail('DEAL_NOT_FOUND'), { status: 404 });
    }

    // Check workspace ownership
    const membership = await prisma.membership.findFirst({
      where: {
        userId: authResult.user.id,
        workspaceId: deal.workspaceId
      }
    });

    if (!membership) {
      return NextResponse.json(fail('UNAUTHORIZED_ACCESS'), { status: 403 });
    }

    // Update the deal's nextStep field
    const updatedDeal = await prisma.deal.update({
      where: { id: params.id },
      data: { nextStep }
    });

    return NextResponse.json(ok(updatedDeal));
  } catch (error) {
    console.error('Error updating deal next step:', error);
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 });
  }
}
