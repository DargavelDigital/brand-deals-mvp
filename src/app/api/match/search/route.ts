import { NextRequest, NextResponse } from 'next/server';
import { currentWorkspaceId } from '@/lib/workspace';
import type { BrandSearchInput } from '@/types/match';
import { searchLocal, searchKnown } from '@/services/brands/searchBroker';
import { getCachedCandidates, setCachedCandidates } from '@/services/cache/brandCandidateCache';
import { aiRankCandidates } from '@/services/brands/aiRanker';
import { prisma } from '@/lib/prisma';
import { flag } from '@/lib/flags';

async function getLatestAuditSnapshot(workspaceId: string) {
  const audit = await prisma.audit.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });
  return audit?.snapshotJson ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await currentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 401 });

    const body: BrandSearchInput = await req.json();
    const termKey = JSON.stringify({ geo: body.geo, radiusKm: body.radiusKm, categories: body.categories, keywords: body.keywords });

    const cached = await getCachedCandidates(workspaceId, termKey);
    let candidates = cached;
    if (!candidates) {
      const lists: any[] = [];
              if (body.includeLocal && flag('match.local.enabled')) {
        lists.push(await searchLocal(body));
      }
      if (body.keywords?.length) {
        lists.push(await searchKnown(body));
      }
      candidates = lists.flat();
      await setCachedCandidates(workspaceId, termKey, candidates);
    }

    const auditSnapshot = await getLatestAuditSnapshot(workspaceId);
    if (!auditSnapshot) {
      return NextResponse.json({ matches: [], note: 'No audit snapshot yet' });
    }

            const ranked = flag('ai.match.v2')
      ? await aiRankCandidates(auditSnapshot, candidates, body.limit ?? 24)
      : candidates.slice(0, body.limit ?? 24).map((c: any) => ({ ...c, score: 50, rationale: 'Fallback mode', pitchIdea: '—', factors: [] }));

    return NextResponse.json({ matches: ranked });
  } catch (e: any) {
    console.error('match/search error', e);
    return NextResponse.json({ error: 'Failed to search and rank' }, { status: 500 });
  }
}
