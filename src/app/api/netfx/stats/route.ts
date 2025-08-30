import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isOn } from '@/config/flags';

export async function GET(_: NextRequest) {
  if (!isOn('netfx.enabled')) {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 404 });
  }

  try {
    // Get total counts
    const [totalSends, totalReplies, totalWins] = await Promise.all([
      prisma.signalEvent.count(),
      prisma.signalEvent.count({ where: { replied: true } }),
      prisma.signalEvent.count({ where: { won: true } })
    ]);

    // Calculate rates
    const avgReplyRate = totalSends > 0 ? totalReplies / totalSends : 0;
    const avgWinRate = totalSends > 0 ? totalWins / totalSends : 0;

    // Get average deal value
    const dealValueResult = await prisma.signalEvent.aggregate({
      where: { won: true, valueUsd: { not: null } },
      _avg: { valueUsd: true }
    });
    const avgDealValue = dealValueResult._avg.valueUsd || 0;

    const stats = {
      totalSends,
      totalReplies,
      totalWins,
      avgReplyRate,
      avgWinRate,
      avgDealValue
    };

    return NextResponse.json({ ok: true, stats });
  } catch (error) {
    console.error('Failed to fetch telemetry stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
