import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { getWorkspaceCostSummary } from '@/services/ai/track-usage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user.role !== 'SUPER' && !session.user.isAdmin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const workspaceId = params.id;
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') 
    ? new Date(searchParams.get('startDate')!) 
    : undefined;
  const endDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate')!)
    : undefined;
  
  try {
    const summary = await getWorkspaceCostSummary(workspaceId, startDate, endDate);
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching workspace costs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace costs' },
      { status: 500 }
    );
  }
}

