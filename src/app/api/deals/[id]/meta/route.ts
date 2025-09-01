import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/http/envelope';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { nextStep, status } = await request.json();
    
    // Validate inputs
    if (nextStep !== undefined && typeof nextStep !== 'string') {
      return NextResponse.json(fail('INVALID_NEXT_STEP', 400), { status: 400 });
    }
    
    if (status !== undefined && typeof status !== 'string') {
      return NextResponse.json(fail('INVALID_STATUS', 400), { status: 400 });
    }

    // Verify deal exists and user has access to workspace
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: { workspace: true }
    });

    if (!deal) {
      return NextResponse.json(fail('DEAL_NOT_FOUND', 404), { status: 404 });
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

    // Prepare update data
    const updateData: any = {};
    
    // Handle next step - append or replace "//NEXT: ..." suffix in description
    if (nextStep !== undefined) {
      const currentDesc = deal.description || '';
      const nextStepPattern = /\s*\/\/NEXT:.*$/;
      
      if (nextStep.trim()) {
        // Add or replace next step suffix
        const newDesc = currentDesc.replace(nextStepPattern, '') + `//NEXT: ${nextStep.trim()}`;
        updateData.description = newDesc;
      } else {
        // Remove next step suffix if empty
        updateData.description = currentDesc.replace(nextStepPattern, '');
      }
    }
    
    // Handle status update
    if (status !== undefined) {
      updateData.status = status;
    }

    // Update the deal
    const updatedDeal = await prisma.deal.update({
      where: { id: params.id },
      data: updateData
    });

    // Extract next step from description for response
    const nextStepFromDesc = updatedDeal.description?.match(/\/\/NEXT: (.+)$/)?.[1] || '';

    return NextResponse.json(ok({
      id: updatedDeal.id,
      status: updatedDeal.status,
      nextStep: nextStepFromDesc
    }));
  } catch (error) {
    console.error('Error updating deal metadata:', error);
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 });
  }
}
