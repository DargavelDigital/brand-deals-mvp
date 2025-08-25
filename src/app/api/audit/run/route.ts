import { NextRequest, NextResponse } from 'next/server';
import { getProviders } from '@/services/providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, socialAccounts = [] } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    const providers = getProviders();
    const auditResult = await providers.audit(workspaceId, socialAccounts);
    
    return NextResponse.json({ result: auditResult });
  } catch (error: any) {
    console.error('Error running audit:', error);
    return NextResponse.json(
      { error: 'Failed to run audit' },
      { status: 500 }
    );
  }
}
