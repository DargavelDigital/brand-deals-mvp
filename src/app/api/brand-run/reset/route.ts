import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get workspace
    const membership = await prisma().membership.findFirst({
      where: { userId },
      select: { workspaceId: true }
    });

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    const workspaceId = membership.workspaceId;
    console.log('🔄 RESET: Starting reset for workspace:', workspaceId);

    // Delete BrandMatch records first (to avoid foreign key issues)
    const deletedMatches = await prisma().brandMatch.deleteMany({
      where: { workspaceId }
    });
    console.log('🔄 RESET: Deleted', deletedMatches.count, 'BrandMatch records');

    // Delete BrandRun
    const deletedRuns = await prisma().brandRun.deleteMany({
      where: { workspaceId }
    });
    console.log('🔄 RESET: Deleted', deletedRuns.count, 'BrandRun records');

    console.log('✅ RESET: Workflow reset successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Workflow reset successfully',
      deleted: {
        brandMatches: deletedMatches.count,
        brandRuns: deletedRuns.count
      }
    });

  } catch (error: any) {
    console.error('❌ RESET: Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset workflow' },
      { status: 500 }
    );
  }
}

