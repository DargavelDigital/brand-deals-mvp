import { NextRequest, NextResponse } from 'next/server';
import { manualDispatch } from '@/services/sequence/scheduler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        error: 'Manual dispatch not allowed in production' 
      }, { status: 403 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Manually dispatch due steps
    await manualDispatch();
    
    return NextResponse.json({
      success: true,
      message: 'Manual dispatch completed'
    });
  } catch (error) {
    console.error('Manual dispatch API error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to dispatch sequence steps' 
    }, { status: 500 });
  }
}
