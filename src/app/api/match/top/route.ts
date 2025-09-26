import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { requireSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma';
import { withApiLogging } from '@/lib/api-wrapper';
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  return NextResponse.json({ message: 'Match top endpoint' });
}

export const POST = withIdempotency(async (request: NextRequest) => {
  return withApiLogging(async (req: NextRequest) => {
    try {
      // Get authenticated user context
      const session = await requireSession(req);
      if (session instanceof NextResponse) return session;
      
      const body = await req.json();
      const { workspaceId, criteria } = body;

      // TODO: Implement actual brand matching logic
      // For now, return mock data to fix the 405 error
      const mockMatches = {
        matches: {
          brands: [
            {
              id: '1',
              name: 'Nike',
              logo: 'https://logo.clearbit.com/nike.com',
              description: 'Global athletic footwear and apparel brand',
              relevance: 0.95,
              tags: ['Fitness', 'Sports', 'Lifestyle'],
              matchScore: 94,
              industry: 'Sports & Fitness',
              website: 'https://nike.com',
              reasons: ['High audience overlap', 'Brand alignment', 'Recent campaigns']
            },
            {
              id: '2',
              name: 'Apple',
              logo: 'https://logo.clearbit.com/apple.com',
              description: 'Technology company known for innovative consumer electronics',
              relevance: 0.87,
              tags: ['Technology', 'Electronics', 'Lifestyle'],
              matchScore: 87,
              industry: 'Technology',
              website: 'https://apple.com',
              reasons: ['Premium brand positioning', 'Innovation focus', 'Global reach']
            }
          ]
        }
      };

      return NextResponse.json(mockMatches);
    } catch (error: any) {
      log.error('Error in match/top:', error);
      return NextResponse.json(
        { error: 'Failed to get brand matches' },
        { status: 500 }
      );
    }
  })(request);
});
