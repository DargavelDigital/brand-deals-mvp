import { NextRequest, NextResponse } from 'next/server';
import { getLatestAudit } from '@/services/audit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    const latestAudit = await getLatestAudit(workspaceId);
    
    return NextResponse.json({ audit: latestAudit });
  } catch (error: any) {
    console.error('Error getting latest audit:', error);
    return NextResponse.json(
      { error: 'Failed to get latest audit' },
      { status: 500 }
    );
  }
}
