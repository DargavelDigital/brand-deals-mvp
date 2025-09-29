import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  try {
    // Only creators and superusers can revoke agency access
    const session = await requireRole(req, ['creator', 'superuser']);
    
    // Get the current user's workspace
    const workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
    }

    // Find all agency members (non-owners) in the workspace
    const agencyMembers = await prisma().workspaceMember.findMany({
      where: {
        workspaceId: workspaceId,
        role: {
          not: 'OWNER'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (agencyMembers.length === 0) {
      return NextResponse.json({ 
        message: 'No agency members found to revoke access from',
        data: { revokedCount: 0 }
      });
    }

    // Revoke access for all agency members
    const revokedMembers = await prisma().workspaceMember.deleteMany({
      where: {
        workspaceId: workspaceId,
        role: {
          not: 'OWNER'
        }
      }
    });

    // Log the action for audit purposes
    console.log(`Agency access revoked for ${revokedMembers.count} members in workspace ${workspaceId} by user ${session.user.email}`);

    return NextResponse.json({
      message: `Successfully revoked access for ${revokedMembers.count} agency members`,
      data: {
        revokedCount: revokedMembers.count,
        revokedMembers: agencyMembers.map(member => ({
          id: member.user.id,
          email: member.user.email,
          name: member.user.name,
          role: member.role
        }))
      }
    });

  } catch (error) {
    console.error('Error revoking agency access:', error);
    
    if (error instanceof NextResponse) {
      return error;
    }
    
    return NextResponse.json(
      { error: 'Failed to revoke agency access' },
      { status: 500 }
    );
  }
}
