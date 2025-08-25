import { NextRequest, NextResponse } from 'next/server';
import { getLatestAudit } from '@/services/audit/index';

export async function GET(request: NextRequest) {
  try {
    // For now, use a mock workspace ID
    const workspaceId = 'demo-workspace';
    
    const latestAudit = await getLatestAudit(workspaceId);
    
    if (!latestAudit) {
      return NextResponse.json({ error: 'No audit found' }, { status: 404 });
    }
    
    return NextResponse.json(latestAudit);
  } catch (error) {
    console.error('Failed to get latest audit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
