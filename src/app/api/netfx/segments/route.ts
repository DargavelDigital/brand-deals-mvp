import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isOn } from '@/config/flags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(_: NextRequest) {
  if (!isOn('netfx.enabled')) {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 404 });
  }

  try {
    // Get segment performance data
    const segments = await prisma().$queryRaw<Array<{
      industry: string | null;
      sizeBand: string | null;
      region: string | null;
      sends: bigint;
      replies: bigint;
      wins: bigint;
    }>>`
      SELECT 
        industry,
        sizeBand,
        region,
        COUNT(*) as sends,
        COUNT(CASE WHEN replied = true THEN 1 END) as replies,
        COUNT(CASE WHEN won = true THEN 1 END) as wins
      FROM "SignalEvent"
      WHERE industry IS NOT NULL 
        OR sizeBand IS NOT NULL 
        OR region IS NOT NULL
      GROUP BY industry, sizeBand, region
      HAVING COUNT(*) >= 10
      ORDER BY sends DESC
      LIMIT 50
    `;

    // Transform the data
    const transformedSegments = segments.map(segment => ({
      industry: segment.industry || 'Unknown',
      sizeBand: segment.sizeBand || 'Unknown',
      region: segment.region || 'Unknown',
      sends: Number(segment.sends),
      replies: Number(segment.replies),
      wins: Number(segment.wins),
      replyRate: Number(segment.sends) > 0 ? Number(segment.replies) / Number(segment.sends) : 0,
      winRate: Number(segment.sends) > 0 ? Number(segment.wins) / Number(segment.sends) : 0
    }));

    return NextResponse.json({ ok: true, segments: transformedSegments });
  } catch (error) {
    console.error('Failed to fetch segment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segments' },
      { status: 500 }
    );
  }
}
