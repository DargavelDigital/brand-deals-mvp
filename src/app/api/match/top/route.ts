import { NextRequest, NextResponse } from 'next/server';
import { scoreBrandsForWorkspace } from '@/services/match/score';

export async function GET(request: NextRequest) {
  try {
    // For now, use a demo workspace ID since auth is not set up
    const workspaceId = 'demo-workspace';
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get top brand matches
    const matches = await scoreBrandsForWorkspace(workspaceId, limit);

    return NextResponse.json({
      success: true,
      data: matches,
      count: matches.length,
    });

  } catch (error) {
    console.error('Error fetching top brand matches:', error);
    
    if (error instanceof Error && error.message.includes('No audit data')) {
      return NextResponse.json(
        { error: 'No audit data found. Please run an audit first.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch brand matches' },
      { status: 500 }
    );
  }
}
