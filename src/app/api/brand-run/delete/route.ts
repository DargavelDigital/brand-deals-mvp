import { NextRequest, NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * DELETE /api/brand-run/delete
 * 
 * Deletes all brand runs for the current workspace.
 * Useful for resetting workflow or clearing old data.
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get workspaceId from session
    const auth = await requireSessionOrDemo(request);
    const workspaceId = auth?.workspaceId || (typeof auth === 'string' ? auth : null);
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Unauthorized - no workspace found' },
        { status: 401 }
      );
    }
    
    console.log('🗑️ Deleting all brand runs for workspace:', workspaceId);
    
    // Delete all brand runs for this workspace
    const result = await prisma().brandRun.deleteMany({
      where: { workspaceId }
    });
    
    console.log('✅ Deleted', result.count, 'brand run(s)');
    
    return NextResponse.json({ 
      ok: true, 
      deleted: result.count,
      message: `Successfully deleted ${result.count} brand run(s)`
    });
    
  } catch (error: any) {
    console.error('❌ Error deleting brand runs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete brand runs' },
      { status: 500 }
    );
  }
}

