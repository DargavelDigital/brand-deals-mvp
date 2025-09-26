import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await requireSessionOrDemo(request);

    // Get all deals for the workspace
    const deals = await prisma.deal.findMany({
      where: { workspaceId },
      select: {
        offerAmount: true,
        counterAmount: true,
        finalAmount: true,
        status: true,
        category: true,
        createdAt: true,
      },
    });

    // Calculate analytics
    const totalDeals = deals.length;
    const wonDeals = deals.filter(d => d.status === 'WON');
    const lostDeals = deals.filter(d => d.status === 'LOST');
    const counteredDeals = deals.filter(d => d.status === 'COUNTERED');

    // Calculate uplift metrics
    let totalUplift = 0;
    let totalUpliftPct = 0;
    let dealsWithUplift = 0;

    wonDeals.forEach(deal => {
      if (deal.finalAmount && deal.offerAmount) {
        const uplift = deal.finalAmount - deal.offerAmount;
        const upliftPct = (uplift / deal.offerAmount) * 100;
        totalUplift += uplift;
        totalUpliftPct += upliftPct;
        dealsWithUplift++;
      }
    });

    const avgUplift = dealsWithUplift > 0 ? totalUplift / dealsWithUplift : 0;
    const avgUpliftPct = dealsWithUplift > 0 ? totalUpliftPct / dealsWithUplift : 0;

    // Calculate average amounts
    const avgOfferAmount = deals.length > 0 
      ? deals.reduce((sum, d) => sum + d.offerAmount, 0) / deals.length 
      : 0;
    
    const avgFinalAmount = wonDeals.length > 0 
      ? wonDeals.reduce((sum, d) => sum + (d.finalAmount || 0), 0) / wonDeals.length 
      : 0;

    // Category insights
    const categoryStats = deals.reduce((acc, deal) => {
      if (deal.category) {
        if (!acc[deal.category]) {
          acc[deal.category] = {
            count: 0,
            totalOffer: 0,
            totalFinal: 0,
            totalUplift: 0,
          };
        }
        
        acc[deal.category].count++;
        acc[deal.category].totalOffer += deal.offerAmount;
        
        if (deal.finalAmount) {
          acc[deal.category].totalFinal += deal.finalAmount;
          acc[deal.category].totalUplift += (deal.finalAmount - deal.offerAmount);
        }
      }
      return acc;
    }, {} as Record<string, any>);

    // Calculate category averages
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.avgOffer = stats.count > 0 ? stats.totalOffer / stats.count : 0;
      stats.avgFinal = stats.count > 0 ? stats.totalFinal / stats.count : 0;
      stats.avgUpliftPct = stats.totalOffer > 0 
        ? (stats.totalUplift / stats.totalOffer) * 100 
        : 0;
    });

    const analytics = {
      overview: {
        totalDeals,
        wonDeals: wonDeals.length,
        lostDeals: lostDeals.length,
        counteredDeals: counteredDeals.length,
        winRate: totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0,
      },
      financials: {
        avgOfferAmount: Math.round(avgOfferAmount),
        avgFinalAmount: Math.round(avgFinalAmount),
        avgUplift: Math.round(avgUplift),
        avgUpliftPct: Math.round(avgUpliftPct * 100) / 100,
        totalUplift: Math.round(totalUplift),
      },
      categoryInsights: categoryStats,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    log.error('Deal analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal analytics' },
      { status: 500 }
    );
  }
}
