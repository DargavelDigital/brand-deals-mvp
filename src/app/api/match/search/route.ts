import { NextRequest, NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import type { BrandSearchInput, BrandCandidate } from '@/types/match';
import { aiRankCandidates } from '@/services/brands/aiRanker';
import { prisma } from '@/lib/prisma';
import { flag } from '@/lib/flags';
import { suggestBrandsFromAudit, hasMinimalDataForSuggestions } from '@/services/brands/ai-suggestions';

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

/**
 * Extract domain from URL
 */
function extractDomainFromUrl(url: string): string | undefined {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./,'').toLowerCase();
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body first
    const body: BrandSearchInput = await req.json();
    
    // Get workspace from session (works for OAuth users)
    const sessionData = await requireSessionOrDemo(req);
    
    if (!sessionData || !sessionData.workspaceId) {
      console.error('❌ No authenticated session found');
      return NextResponse.json({ 
        error: 'UNAUTHENTICATED',
        message: 'Please log in to search for brand matches'
      }, { status: 401 });
    }
    
    const workspaceId = sessionData.workspaceId;
    console.log('🔍 Using workspaceId from session:', workspaceId);

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
    // Try multiple paths to find post counts
    const socialSnapshot = auditSnapshot.socialSnapshot || {};
    
    // Debug: Log the audit snapshot structure
    console.log('🔍 DEBUG: Audit snapshot keys:', Object.keys(auditSnapshot));
    console.log('🔍 DEBUG: socialSnapshot exists:', !!socialSnapshot);
    console.log('🔍 DEBUG: socialSnapshot keys:', Object.keys(socialSnapshot));
    console.log('🔍 DEBUG: Instagram data:', socialSnapshot.instagram ? 'EXISTS' : 'MISSING');
    if (socialSnapshot.instagram) {
      console.log('🔍 DEBUG: Instagram posts array:', socialSnapshot.instagram.posts?.length || 0);
    }
    
    // Count posts from socialSnapshot
    let instagramPosts = socialSnapshot.instagram?.posts?.length || 0;
    let tiktokVideos = socialSnapshot.tiktok?.videos?.length || 0;
    let youtubVideos = socialSnapshot.youtube?.videos?.length || 0;
    
    // Fallback: Try to get post count from performance or other fields
    if (instagramPosts === 0 && auditSnapshot.performance) {
      console.log('🔍 DEBUG: Trying performance field for post count');
      instagramPosts = auditSnapshot.performance.totalPosts || 
                       auditSnapshot.performance.instagramPosts || 0;
    }
    
    const totalPosts = instagramPosts + tiktokVideos + youtubVideos;
    
    console.log('🔍 DEBUG: Final post counts:', {
      instagram: instagramPosts,
      tiktok: tiktokVideos,
      youtube: youtubVideos,
      total: totalPosts
    });
    
    // Check if account is too new or has insufficient content
    const hasEnoughContent = totalPosts >= 20;
    
    // If insufficient data, return helpful guidance with specific messaging
    if (!hasEnoughFollowers || !hasEnoughContent || !hasBrandFit) {
      // Build specific requirements list
      const requirements = [];
      const tips = [];
      
      // Requirement 1: Followers
      if (!hasEnoughFollowers) {
        const needed = 1000 - followers;
        requirements.push({
          met: false,
          label: 'Minimum 1,000 followers',
          current: `Current: ${followers.toLocaleString()} followers`,
          needed: `Need: ${needed.toLocaleString()} more followers`
        });
        tips.push('Focus on consistent posting (3-5 times per week) to grow your follower base.');
        tips.push('Engage with your audience through comments, stories, and direct messages.');
      } else {
        requirements.push({
          met: true,
          label: 'Minimum 1,000 followers',
          current: `Current: ${followers.toLocaleString()} followers`,
          needed: null
        });
      }
      
      // Requirement 2: Content
      if (!hasEnoughContent) {
        const needed = 20 - totalPosts;
        requirements.push({
          met: false,
          label: 'Minimum 20 posts with engagement',
          current: `Current: ${totalPosts} posts (${instagramPosts} IG, ${tiktokVideos} TikTok, ${youtubVideos} YouTube)`,
          needed: `Need: ${needed} more posts`
        });
        tips.push(`Post at least ${needed} more pieces of content with engagement data (likes, comments, shares).`);
        tips.push('Use relevant hashtags and post at optimal times for your audience.');
      } else {
        requirements.push({
          met: true,
          label: 'Minimum 20 posts with engagement',
          current: `Current: ${totalPosts} posts`,
          needed: null
        });
      }
      
      // Requirement 3: Brand Fit
      if (!hasBrandFit) {
        requirements.push({
          met: false,
          label: 'Brand fit analysis completed',
          current: 'Current: No brand fit data',
          needed: 'Run an AI audit to analyze your brand fit'
        });
        tips.push('Run a full AI audit to analyze your brand fit and partnership opportunities.');
      } else {
        requirements.push({
          met: true,
          label: 'Brand fit analysis completed',
          current: 'Completed via AI audit',
          needed: null
        });
      }
      
      // Additional tips
      tips.push('Collaborate with other creators in your niche to reach new audiences.');
      tips.push('Run your audit again after growing your account to unlock brand matches.');
      
      console.log('⚠️ Insufficient data for quality matches:', {
        followers,
        hasEnoughFollowers,
        totalPosts,
        totalPosts,
        hasEnoughContent,
        hasBrandFit
      });
      
      console.log('🔍 Requirements being sent:', JSON.stringify(requirements, null, 2));
      
      return NextResponse.json({
        matches: [],
        error: 'INSUFFICIENT_DATA',
        message: 'Your account needs more data for accurate brand matching',
        requirements: requirements,
        tips: tips,
        action: {
          label: 'View Audit Results',
          href: '/tools/audit'
        }
      });
    }

    // ─────────────────────────────────────────────────────────
    // Step 3: Get AI brand suggestions based on audit profile
    // ─────────────────────────────────────────────────────────
    
    console.log('🤖 Using AI brand suggestions instead of Google/Yelp APIs');
    
    // Check if we have enough audit data for meaningful suggestions
    if (!hasMinimalDataForSuggestions(auditSnapshot)) {
      console.log('⚠️ Insufficient audit data for AI brand suggestions');
      return NextResponse.json({
        matches: [],
        error: 'INSUFFICIENT_AUDIT_DATA',
        message: 'Your audit data is incomplete. Please run a full audit to get brand suggestions.',
        tips: [
          'Ensure your audit includes niche information',
          'Make sure content themes are captured',
          'Verify audience interests are available'
        ],
        action: {
          label: 'Run AI Audit',
          href: '/tools/audit'
        }
      });
    }
    
    // Get AI brand suggestions
    const aiSuggestions = await suggestBrandsFromAudit(auditSnapshot);
    
    // Check if AI returned any suggestions
    const totalSuggestions = 
      aiSuggestions.international.length + 
      aiSuggestions.national.length + 
      aiSuggestions.local.length;
    
    if (totalSuggestions === 0) {
      console.log('⚠️ AI returned no brand suggestions');
      return NextResponse.json({
        matches: [],
        error: 'NO_AI_SUGGESTIONS',
        message: 'Unable to generate brand suggestions at this time',
        tips: [
          'Try running your audit again',
          'Ensure your profile has complete information',
          'Check that your audience data is comprehensive'
        ],
        action: {
          label: 'Run AI Audit',
          href: '/tools/audit'
        }
      });
    }
    
    console.log('✅ AI Suggestions received:', {
      international: aiSuggestions.international.length,
      national: aiSuggestions.national.length,
      local: aiSuggestions.local.length,
      total: totalSuggestions
    });
    
    // ─────────────────────────────────────────────────────────
    // Step 4: Convert AI suggestions to BrandCandidate format
    // ─────────────────────────────────────────────────────────
    
    const candidates: BrandCandidate[] = [];
    
    // Convert international brands
    aiSuggestions.international.forEach((brand, index) => {
      candidates.push({
        id: `ai-international-${index}`,
        source: 'seed',
        name: brand.name,
        domain: extractDomainFromUrl(brand.website),
        categories: [brand.industry],
        socials: { website: brand.website },
        // Store AI-specific data in the candidate for later use
      });
    });
    
    // Convert national brands
    aiSuggestions.national.forEach((brand, index) => {
      candidates.push({
        id: `ai-national-${index}`,
        source: 'seed',
        name: brand.name,
        domain: extractDomainFromUrl(brand.website),
        categories: [brand.industry],
        socials: { website: brand.website },
      });
    });
    
    // Convert local brands
    aiSuggestions.local.forEach((brand, index) => {
      candidates.push({
        id: `ai-local-${index}`,
        source: 'seed',
        name: brand.name,
        domain: extractDomainFromUrl(brand.website),
        categories: [brand.industry],
        socials: { website: brand.website },
      });
    });
    
    console.log('✅ Converted', candidates.length, 'AI suggestions to BrandCandidates');

    // ─────────────────────────────────────────────────────────
    // Step 5: Rank brands with AI
    // ─────────────────────────────────────────────────────────
    
    const matchV2Enabled = flag('ai.match.v2');
    console.log('🔍 AI Match V2 enabled:', matchV2Enabled);
    
    const ranked = matchV2Enabled
      ? await aiRankCandidates(auditSnapshot, candidates, body.limit ?? 24)
      : candidates.slice(0, body.limit ?? 24).map((c: any) => ({ 
          ...c, 
          score: 75, // Higher default score for AI-suggested brands
          rationale: 'AI-suggested brand based on your profile', 
          pitchIdea: 'Tailored partnership opportunity', 
          factors: [] 
        }));

    console.log('✅ Ranked', ranked.length, 'brands');
    console.log('🔍 First ranked brand:', ranked[0]);

    return NextResponse.json({ matches: ranked });
  } catch (e: any) {
    console.error('match/search error', e);
    return NextResponse.json({ error: 'Failed to search and rank' }, { status: 500 });
  }
}
