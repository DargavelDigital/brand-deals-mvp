import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';
import { requireAuth } from '@/lib/auth/getAuth';

export async function POST(req: Request) {
  try {
    const guard = await requireAuth(['OWNER', 'MANAGER', 'MEMBER']);
    if (!guard.ok) {
      return NextResponse.json({ ok: false, error: guard.error }, { status: guard.status });
    }

    const { type, targetId, decision, comment } = await req.json();

    // Validate required fields
    if (!type || !targetId || !decision) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: type, targetId, decision' },
        { status: 400 }
      );
    }

    // Validate enum values
    if (!['MATCH', 'OUTREACH', 'AUDIT'].includes(type)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid type. Must be MATCH, OUTREACH, or AUDIT' },
        { status: 400 }
      );
    }

    if (!['UP', 'DOWN'].includes(decision)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid decision. Must be UP or DOWN' },
        { status: 400 }
      );
    }

    // Check if user already gave feedback for this target
    const existingFeedback = await prisma.aiFeedback.findFirst({
      where: {
        workspaceId: guard.ctx.workspaceId,
        userId: guard.ctx.user.id,
        type: type as any,
        targetId
      }
    });

    let feedback;
    if (existingFeedback) {
      // Update existing feedback
      feedback = await prisma.aiFeedback.update({
        where: { id: existingFeedback.id },
        data: {
          decision: decision as any,
          comment: comment || null,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new feedback
      feedback = await prisma.aiFeedback.create({
        data: {
          workspaceId: guard.ctx.workspaceId,
          userId: guard.ctx.user.id,
          type: type as any,
          targetId,
          decision: decision as any,
          comment: comment || null
        }
      });
    }

    return NextResponse.json({
      ok: true,
      data: feedback,
      message: existingFeedback ? 'Feedback updated' : 'Feedback submitted'
    });

  } catch (error) {
    console.error('[feedback/submit] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
