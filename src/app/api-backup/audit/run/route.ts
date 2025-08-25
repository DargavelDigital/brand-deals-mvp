import { NextRequest, NextResponse } from 'next/server';
import { runRealAudit } from '@/services/audit/index';

export async function POST(request: NextRequest) {
  try {
    // For now, use a mock workspace ID
    const workspaceId = 'demo-workspace';
    
    const auditResult = await runRealAudit(workspaceId);
    
    return NextResponse.json({
      success: true,
      data: auditResult
    });
  } catch (error) {
    console.error('Audit run failed:', error);
    return NextResponse.json({ 
      error: 'Failed to run audit' 
    }, { status: 500 });
  }
}
