import { NextRequest, NextResponse } from 'next/server';
import { currentWorkspaceId } from '@/lib/workspace';
import type { BrandSearchInput } from '@/types/match';
import { searchLocal } from '@/services/brands/searchBroker';
import { getCachedCandidates, setCachedCandidates } from '@/services/cache/brandCandidateCache';
import { aiRankCandidates } from '@/services/brands/aiRanker';
import { prisma } from '@/lib/prisma';
import { flag } from '@/lib/flags';

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

    // ─────────────────────────────────────────────────────────
    // Step 1: Check if audit exists
    // ─────────────────────────────────────────────────────────
    
    console.log('🔍 Getting latest audit snapshot...');
    const auditSnapshot = await getLatestAuditSnapshot(workspaceId);
    
    if (!auditSnapshot) {
      console.log('❌ No audit snapshot found for workspace:', workspaceId);
      return NextResponse.json({ 
        matches: [], 
        error: 'NO_AUDIT',
        message: 'Please run an audit first to generate brand matches',
        action: {
          label: 'Run AI Audit',
          href: '/tools/audit'
        }
      });
    }
    
    console.log('✅ Audit snapshot found');

    // ─────────────────────────────────────────────────────────
    // Step 2: Check data sufficiency
    // ─────────────────────────────────────────────────────────
    
    const followers = auditSnapshot.audience?.totalFollowers || auditSnapshot.audience?.size || 0;
    const hasEnoughFollowers = followers >= 1000;
    const hasBrandFit = !!auditSnapshot.brandFit;
    const hasContentSignals = (auditSnapshot.contentSignals?.length || 0) >= 3;
    
    // Calculate account metrics from snapshot
    const socialSnapshot = auditSnapshot.socialSnapshot || {};
    const instagramPosts = socialSnapshot.instagram?.posts?.length || 0;
    const tiktokVideos = socialSnapshot.tiktok?.videos?.length || 0;
    const youtubVideos = socialSnapshot.youtube?.videos?.length || 0;
    const totalPosts = instagramPosts + tiktokVideos + youtubVideos;
    
    // Check if account is too new or has insufficient content
    const hasEnoughContent = totalPosts >= 20;
    
    // If insufficient data, return helpful guidance
    if (!hasEnoughFollowers || !hasEnoughContent || !hasBrandFit) {
      console.log('⚠️ Insufficient data for quality matches:', {
        followers,
        hasEnoughFollowers,
        totalPosts,
        hasEnoughContent,
        hasBrandFit
      });
      
      return NextResponse.json({
        matches: [],
        error: 'INSUFFICIENT_DATA',
        message: 'Your account needs more data for accurate brand matching',
        requirements: [
          { 
            item: 'Connect Instagram', 
            status: auditSnapshot.sources?.includes('INSTAGRAM') || auditSnapshot.sources?.includes('instagram') ? 'complete' : 'incomplete',
            required: true
          },
          { 
            item: 'Reach 1,000+ followers', 
            status: hasEnoughFollowers ? 'complete' : 'incomplete',
            current: followers.toLocaleString(),
            target: '1,000',
            required: true
          },
          { 
            item: 'Post 20+ pieces of content', 
            status: hasEnoughContent ? 'complete' : 'incomplete',
            current: totalPosts.toString(),
            target: '20',
            required: true
          },
          { 
            item: 'Build 30 days of engagement history', 
            status: hasBrandFit ? 'complete' : 'incomplete',
            info: 'Keep posting and engaging with your audience',
            required: false
          }
        ],
        currentStatus: {
          connected: auditSnapshot.sources?.length > 0,
          followers,
          posts: totalPosts,
          engagementRate: auditSnapshot.audience?.avgEngagement || auditSnapshot.audience?.engagementRate || 0
        },
        tips: [
          'Focus on consistent posting (3-5 times per week)',
          'Engage with your audience through comments and stories',
          'Use relevant hashtags to reach new followers',
          'Collaborate with other creators in your niche',
          'Run your audit again after growing your account'
        ],
        action: {
          label: 'View Audit Results',
          href: '/tools/audit'
        }
      });
    }

    // ─────────────────────────────────────────────────────────
    // Step 3: Search for real brands (ONLY after data check passes)
    // ─────────────────────────────────────────────────────────
    
    const termKey = JSON.stringify({ geo: body.geo, radiusKm: body.radiusKm, categories: body.categories, keywords: body.keywords });

    const cached = await getCachedCandidates(workspaceId, termKey);
    let candidates = cached;
    
    if (!candidates) {
      console.log('🔍 No cache found, discovering brands...');
      const lists: any[] = [];
      
      const localEnabled = flag('match.local.enabled');
      console.log('🔍 Local flag enabled:', localEnabled);
      
      if (body.includeLocal && localEnabled) {
        console.log('🔍 Searching local brands (Google/Yelp)...');
        const localResults = await searchLocal(body);
        console.log('🔍 Local results:', localResults.length);
        lists.push(localResults);
      }
      
      // NOTE: searchKnown() removed - it only returned fake "X Co." placeholder brands
      // Real brand search happens via Google Places and Yelp APIs in searchLocal()
      
      candidates = lists.flat();
      console.log('🔍 Total real candidates found:', candidates.length);
      
      await setCachedCandidates(workspaceId, termKey, candidates);
    } else {
      console.log('✅ Using cached candidates:', candidates.length);
    }
    
    // If no brands found, return empty state
    if (candidates.length === 0) {
      console.log('⚠️ No brands found for search criteria');
      return NextResponse.json({
        matches: [],
        error: 'NO_BRANDS_FOUND',
        message: 'No brands found matching your search criteria',
        tips: [
          'Try expanding your search radius',
          'Select different categories',
          'Adjust your location settings'
        ],
        action: {
          label: 'Adjust Search',
          href: '/tools/matches'
        }
      });
    }

    // ─────────────────────────────────────────────────────────
    // Step 4: Rank brands with AI or fallback
    // ─────────────────────────────────────────────────────────
    
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
