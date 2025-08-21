import { NextRequest, NextResponse } from 'next/server';
import { runRealAudit } from '@/services/audit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = session.user;
    
    // Run the real audit
    const auditResult = await runRealAudit(workspaceId);
    
    return NextResponse.json({
      success: true,
      data: auditResult
    });
  } catch (error) {
    console.error('Audit API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Insufficient credits')) {
        return NextResponse.json({ 
          error: error.message,
          code: 'INSUFFICIENT_CREDITS'
        }, { status: 402 });
      }
      
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
