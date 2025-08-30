import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/getAuth';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  const traceId = randomUUID();
  const guard = await requireAuth(['OWNER']);
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error, traceId }, { status: guard.status });
  const { ctx } = guard;

  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'User ID is required', traceId }, { status: 400 });
    }

    // Don't allow removing OWNER
    const membershipToRemove = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: ctx.workspaceId
        }
      },
      include: { user: true }
    });

    if (!membershipToRemove) {
      return NextResponse.json({ ok: false, error: 'Membership not found', traceId }, { status: 404 });
    }

    if (membershipToRemove.role === 'OWNER') {
      return NextResponse.json({ ok: false, error: 'Cannot remove workspace owner', traceId }, { status: 400 });
    }

    // Don't allow removing yourself
    if (membershipToRemove.userId === ctx.user.id) {
      return NextResponse.json({ ok: false, error: 'Cannot remove yourself', traceId }, { status: 400 });
    }

    // Remove the membership
    await prisma.membership.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: ctx.workspaceId
        }
      }
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        workspaceId: ctx.workspaceId,
        userId: ctx.user.id,
        action: 'REMOVE_MANAGER',
        targetId: userId,
        targetType: 'USER',
        meta: { 
          removedUserEmail: membershipToRemove.user.email,
          removedUserRole: membershipToRemove.role
        }
      }
    });

    return NextResponse.json({ 
      ok: true, 
      data: { 
        removedUserId: userId,
        removedUserEmail: membershipToRemove.user.email
      },
      traceId
    });

  } catch (error) {
    console.error('Agency remove error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error', traceId }, { status: 500 });
  }
}
