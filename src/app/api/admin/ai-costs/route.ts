import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Check admin access
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user.role !== 'SUPER' && !session.user.isAdmin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  const where: any = {};
  
  if (workspaceId) {
    where.workspaceId = workspaceId;
  }
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  
  try {
    // Get all logs
    const logs = await prisma().aiUsageLog.findMany({
      where,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Calculate totals
    const totalCost = logs.reduce((sum, log) => sum + log.totalCost, 0);
    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
    const totalRequests = logs.length;
    
    // Group by workspace
    const byWorkspace = logs.reduce((acc, log) => {
      const key = log.workspaceId;
      if (!acc[key]) {
        acc[key] = {
          workspaceId: log.workspaceId,
          workspaceName: log.workspace?.name || 'Unknown',
          cost: 0,
          tokens: 0,
          requests: 0,
        };
      }
      acc[key].cost += log.totalCost;
      acc[key].tokens += log.totalTokens;
      acc[key].requests += 1;
      return acc;
    }, {} as Record<string, any>);
    
    // Group by provider
    const byProvider = logs.reduce((acc, log) => {
      if (!acc[log.provider]) {
        acc[log.provider] = { cost: 0, tokens: 0, requests: 0 };
      }
      acc[log.provider].cost += log.totalCost;
      acc[log.provider].tokens += log.totalTokens;
      acc[log.provider].requests += 1;
      return acc;
    }, {} as Record<string, any>);
    
    // Group by feature
    const byFeature = logs.reduce((acc, log) => {
      if (!acc[log.feature]) {
        acc[log.feature] = { cost: 0, tokens: 0, requests: 0 };
      }
      acc[log.feature].cost += log.totalCost;
      acc[log.feature].tokens += log.totalTokens;
      acc[log.feature].requests += 1;
      return acc;
    }, {} as Record<string, any>);
    
    return NextResponse.json({
      summary: {
        totalCost: parseFloat(totalCost.toFixed(6)),
        totalTokens,
        totalRequests,
      },
      byWorkspace: Object.values(byWorkspace).sort((a: any, b: any) => b.cost - a.cost),
      byProvider,
      byFeature,
      recentLogs: logs.slice(0, 100), // Last 100 logs
    });
  } catch (error) {
    console.error('Error fetching AI costs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI costs' },
      { status: 500 }
    );
  }
}

