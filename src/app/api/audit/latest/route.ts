import { NextRequest, NextResponse } from 'next/server';
import { getLatestAudit } from '@/services/audit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = session.user;
    
    // Get the latest audit
    const latestAudit = await getLatestAudit(workspaceId);
    
    if (!latestAudit) {
      return NextResponse.json({ 
        error: 'No audit found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: latestAudit
    });
  } catch (error) {
    console.error('Latest audit API error:', error);
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
