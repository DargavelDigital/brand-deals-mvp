import { NextRequest, NextResponse } from 'next/server';
import { getProviders } from '@/services/providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, criteria } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    const providers = getProviders();
    const matches = await providers.discovery(workspaceId, criteria || { domain: 'demo.com', name: 'Demo Brand' });
    
    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('Error getting top matches:', error);
    return NextResponse.json(
      { error: 'Failed to get top matches' },
      { status: 500 }
    );
  }
}
