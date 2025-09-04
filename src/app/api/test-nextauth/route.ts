import { NextRequest, NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await requireSessionOrDemo(request);
    
    return NextResponse.json({
      success: true,
      session: workspaceId ? {
        user: {
          workspaceId: workspaceId,
          isDemo: workspaceId === 'demo-workspace'
        }
      } : null,
      message: workspaceId ? 'Authenticated with unified helper' : 'No session found'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Auth test failed'
    });
  }
}
