import { NextRequest, NextResponse } from 'next/server';
import { currentWorkspaceId } from '@/lib/workspace';
import type { BrandSearchInput } from '@/types/match';
import { searchLocal, searchKnown } from '@/services/brands/searchBroker';
import { getCachedCandidates, setCachedCandidates } from '@/services/cache/brandCandidateCache';
import { aiRankCandidates } from '@/services/brands/aiRanker';
import { prisma } from '@/lib/prisma';
import { flag } from '@/lib/flags';
import { getDemoBrands } from '@/services/brands/demo-brands';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function getLatestAuditSnapshot(workspaceId: string) {
  const audit = await prisma().audit.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });
  return audit?.snapshotJson ?? null;
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body first
    const body: BrandSearchInput = await req.json();
    
    // Try to get workspaceId from cookie first, then fall back to request body
    let workspaceId = await currentWorkspaceId();
    
    // Fall back to body.workspaceId if cookie not found
    if (!workspaceId && body.workspaceId) {
      workspaceId = body.workspaceId;
      console.log('🔍 Using workspaceId from request body:', workspaceId);
    } else if (workspaceId) {
      console.log('🔍 Using workspaceId from cookie:', workspaceId);
    }

    // Still no workspace? Return error
    if (!workspaceId) {
      console.error('❌ No workspace ID found in cookie or request body');
      return NextResponse.json({ error: 'No workspace' }, { status: 401 });
    }

    // ✅ DEMO WORKSPACE - Return realistic demo brands
    if (workspaceId === 'demo-workspace') {
      console.log('🎁 Demo workspace - returning realistic demo brands');
      const demoBrands = getDemoBrands(body.limit ?? 24);
      
      // Convert demo brands to match format
      const matches = demoBrands.map(brand => ({
        id: brand.id,
        name: brand.name,
        domain: brand.domain,
        source: 'demo',
        categories: brand.categories || [brand.industry],
        score: brand.score,
        rationale: brand.rationale,
        pitchIdea: brand.pitchIdea,
        factors: [
          { name: 'Audience Match', score: parseInt(brand.audienceMatch || '80') },
          { name: 'Brand Alignment', score: brand.score },
          { name: 'Partnership Readiness', score: 85 }
        ],
        socials: { website: brand.website }
      }));
      
      return NextResponse.json({ matches });
    }

    const termKey = JSON.stringify({ geo: body.geo, radiusKm: body.radiusKm, categories: body.categories, keywords: body.keywords });

    const cached = await getCachedCandidates(workspaceId, termKey);
    let candidates = cached;
    
    if (!candidates) {
      console.log('🔍 No cache found, discovering brands...');
      const lists: any[] = [];
      
      const localEnabled = flag('match.local.enabled');
      console.log('🔍 Local flag enabled:', localEnabled);
      
      if (body.includeLocal && localEnabled) {
        console.log('🔍 Searching local brands...');
        const localResults = await searchLocal(body);
        console.log('🔍 Local results:', localResults.length);
        lists.push(localResults);
      }
      
      if (body.keywords?.length) {
        console.log('🔍 Searching known brands with keywords:', body.keywords);
        const knownResults = await searchKnown(body);
        console.log('🔍 Known results:', knownResults.length);
        lists.push(knownResults);
      }
      
      candidates = lists.flat();
      console.log('🔍 Total candidates found:', candidates.length);
      
      await setCachedCandidates(workspaceId, termKey, candidates);
    } else {
      console.log('✅ Using cached candidates:', candidates.length);
    }

    console.log('🔍 Getting latest audit snapshot...');
    const auditSnapshot = await getLatestAuditSnapshot(workspaceId);
    
    if (!auditSnapshot) {
      console.log('❌ No audit snapshot found for workspace:', workspaceId);
      return NextResponse.json({ matches: [], note: 'No audit snapshot yet' });
    }
    
    console.log('✅ Audit snapshot found');

    const matchV2Enabled = flag('ai.match.v2');
    console.log('🔍 AI Match V2 enabled:', matchV2Enabled);
    
    const ranked = matchV2Enabled
      ? await aiRankCandidates(auditSnapshot, candidates, body.limit ?? 24)
      : candidates.slice(0, body.limit ?? 24).map((c: any) => ({ ...c, score: 50, rationale: 'Fallback mode', pitchIdea: '—', factors: [] }));

    console.log('✅ Ranked', ranked.length, 'brands');
    console.log('🔍 First ranked brand:', ranked[0]);

    return NextResponse.json({ matches: ranked });
  } catch (e: any) {
    console.error('match/search error', e);
    return NextResponse.json({ error: 'Failed to search and rank' }, { status: 500 });
  }
}
