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
    
    console.log('🚨 DEBUG: sessionData:', JSON.stringify(sessionData, null, 2));
    
    if (!sessionData || !sessionData.workspaceId) {
      console.error('❌ No authenticated session found');
      return NextResponse.json({ 
        error: 'UNAUTHENTICATED',
        message: 'Please log in to search for brand matches'
      }, { status: 401 });
    }
    
    const workspaceId = sessionData.workspaceId;
    
    // CRITICAL: Reject if still using demo-workspace for authenticated users
    if (workspaceId === 'demo-workspace') {
      console.error('🚨 CRITICAL: Workspace is still demo-workspace!');
      console.error('🚨 Full session data:', JSON.stringify(sessionData, null, 2));
      return NextResponse.json({ 
        matches: [], 
        error: 'INVALID_WORKSPACE',
        message: 'Invalid workspace detected - please sign out and sign in again',
        action: {
          label: 'Sign Out',
          href: '/auth/signout'
        }
      });
    }
    
    console.log('✅ Using workspaceId from session:', workspaceId);

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
    
    console.log('🚨 === POST COUNT DEBUG === 🚨');
    console.log('Workspace ID:', workspaceId);
    
    // Get the actual audit record from database
    const auditRecord = await prisma().audit.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });
    
    if (auditRecord?.snapshotJson) {
      console.log('🔍 Checking ALL possible post count locations:');
      console.log('  1. performance.totalPosts:', auditRecord.snapshotJson.performance?.totalPosts);
      console.log('  2. performance.instagramPosts:', auditRecord.snapshotJson.performance?.instagramPosts);
      console.log('  3. performance.instagram?.posts:', auditRecord.snapshotJson.performance?.instagram?.posts);
      console.log('  4. instagram.media.length:', auditRecord.snapshotJson.instagram?.media?.length || 0);
      console.log('  5. instagram.posts.length:', auditRecord.snapshotJson.instagram?.posts?.length || 0);
      console.log('  6. socialSnapshot.instagram.posts:', auditRecord.snapshotJson.socialSnapshot?.instagram?.posts?.length || 0);
      console.log('  7. socialSnapshot.instagram.media:', auditRecord.snapshotJson.socialSnapshot?.instagram?.media?.length || 0);
      console.log('  8. socialSnapshot.totalPosts:', auditRecord.snapshotJson.socialSnapshot?.totalPosts);
      console.log('  9. data.posts:', auditRecord.snapshotJson.data?.posts?.length || 0);
      console.log(' 10. TOP-LEVEL KEYS:', Object.keys(auditRecord.snapshotJson));
    }
    
    console.log('🚨 === END POST COUNT DEBUG === 🚨');
    
    const followers = auditSnapshot.audience?.totalFollowers || auditSnapshot.audience?.size || 0;
    const hasEnoughFollowers = followers >= 1000;
    const hasBrandFit = !!auditSnapshot.brandFit;
    const hasContentSignals = (auditSnapshot.contentSignals?.length || 0) >= 3;
    
    // Get the snapshot from audit record
    const snapshot = auditRecord?.snapshotJson || {};
    
    // ═══════════════════════════════════════════════════════════
    // FIX: Try socialSnapshot.derived first (new structure)
    // ═══════════════════════════════════════════════════════════
    const socialSnapshot = snapshot.socialSnapshot || {};
    const socialData = socialSnapshot.derived || socialSnapshot;  // Try derived first, fallback to root
    
    console.log('🔍 Snapshot keys:', Object.keys(snapshot));
    console.log('🔍 SocialSnapshot exists:', !!socialSnapshot);
    console.log('🔍 SocialSnapshot keys:', Object.keys(socialSnapshot));
    console.log('🔍 Using socialData from derived:', !!socialSnapshot.derived);
    
    // ═══════════════════════════════════════════════════════════
    // POST COUNT - Try multiple locations
    // ═══════════════════════════════════════════════════════════
    let instagramPosts = 0;
    let instagramMedia: any[] = [];
    
    // Try socialSnapshot.derived.instagram first
    if (socialData.instagram?.posts) {
      instagramMedia = socialData.instagram.posts;
      instagramPosts = instagramMedia.length;
      console.log('✅ Found Instagram posts:', instagramPosts, 'in socialData');
    } else if (socialData.instagram?.media) {
      instagramMedia = socialData.instagram.media;
      instagramPosts = instagramMedia.length;
      console.log('✅ Found Instagram media:', instagramPosts, 'in socialData');
    } else if (socialSnapshot.instagram?.posts) {
      instagramMedia = socialSnapshot.instagram.posts;
      instagramPosts = instagramMedia.length;
      console.log('✅ Found Instagram posts:', instagramPosts, 'in socialSnapshot root');
    } else if (socialSnapshot.instagram?.media) {
      instagramMedia = socialSnapshot.instagram.media;
      instagramPosts = instagramMedia.length;
      console.log('✅ Found Instagram media:', instagramPosts, 'in socialSnapshot root');
    }
    
    let tiktokVideos: any[] = socialData.tiktok?.videos || socialSnapshot.tiktok?.videos || [];
    let youtubVideos: any[] = socialData.youtube?.videos || socialSnapshot.youtube?.videos || [];
    
    const totalPosts = instagramPosts + tiktokVideos.length + youtubVideos.length;
    
    // ═══════════════════════════════════════════════════════════
    // ENGAGEMENT DETECTION - Check ALL platforms
    // ═══════════════════════════════════════════════════════════
    
    // Check Instagram for engagement
    const hasInstagramEngagement = instagramMedia.length > 0 && instagramMedia.some(post => 
      (post.like_count || 0) > 0 || 
      (post.comments_count || 0) > 0 ||
      (post.engagement || 0) > 0
    );
    
    // Check TikTok for engagement
    const hasTikTokEngagement = tiktokVideos.length > 0 && tiktokVideos.some(video =>
      (video.like_count || 0) > 0 || 
      (video.comment_count || 0) > 0
    );
    
    // Check YouTube for engagement
    const hasYouTubeEngagement = youtubVideos.length > 0 && youtubVideos.some(video =>
      (video.like_count || 0) > 0 || 
      (video.comment_count || 0) > 0
    );
    
    // Overall engagement check
    const hasEngagement = hasInstagramEngagement || hasTikTokEngagement || hasYouTubeEngagement;
    
    // Debug logging
    console.log('🎯 Engagement Detection:');
    console.log('  - Instagram posts:', instagramMedia.length);
    if (instagramMedia.length > 0) {
      console.log('  - Sample post likes:', instagramMedia[0]?.like_count);
      console.log('  - Sample post comments:', instagramMedia[0]?.comments_count);
    }
    console.log('  - Has Instagram engagement?', hasInstagramEngagement);
    console.log('  - Has TikTok engagement?', hasTikTokEngagement);
    console.log('  - Has YouTube engagement?', hasYouTubeEngagement);
    console.log('  - Overall has engagement?', hasEngagement);
    
    console.log('📊 Final counts:', {
      instagram: instagramPosts,
      tiktok: tiktokVideos.length,
      youtube: youtubVideos.length,
      total: totalPosts,
      hasEngagement
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
        const engagementStatus = hasEngagement ? ' with some engagement' : ' with no engagement yet';
        requirements.push({
          met: false,
          label: 'Minimum 20 posts with engagement',
          current: `Current: ${totalPosts} posts (${instagramPosts} IG, ${tiktokVideos.length} TikTok, ${youtubVideos.length} YouTube)${engagementStatus}`,
          needed: `Need: ${needed} more posts with consistent engagement`
        });
        if (hasEngagement) {
          tips.push(`Great start! You have engagement on your posts. Post ${needed} more pieces of content to reach 20 posts total.`);
        } else {
          tips.push(`Post ${needed} more pieces of content that generate engagement (likes, comments, shares).`);
        }
        tips.push('Use relevant hashtags and post at optimal times for your audience.');
      } else {
        requirements.push({
          met: true,
          label: 'Minimum 20 posts with engagement',
          current: `Current: ${totalPosts} posts with engagement data`,
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
        },
        
        // 🔍 DEBUG: See actual snapshot structure in browser Network tab
        _debug: {
          auditId: auditRecord?.id,
          auditExists: !!auditRecord,
          snapshotExists: !!auditRecord?.snapshotJson,
          snapshotKeys: Object.keys(auditRecord?.snapshotJson || {}),
          
          // Instagram locations
          hasInstagram: !!auditRecord?.snapshotJson?.instagram,
          instagramKeys: auditRecord?.snapshotJson?.instagram ? Object.keys(auditRecord.snapshotJson.instagram) : [],
          instagramMediaLength: auditRecord?.snapshotJson?.instagram?.media?.length || 0,
          instagramPostsLength: auditRecord?.snapshotJson?.instagram?.posts?.length || 0,
          
          // SocialSnapshot
          hasSocialSnapshot: !!auditRecord?.snapshotJson?.socialSnapshot,
          socialSnapshotKeys: auditRecord?.snapshotJson?.socialSnapshot ? Object.keys(auditRecord.snapshotJson.socialSnapshot) : [],
          socialSnapshotInstagramKeys: auditRecord?.snapshotJson?.socialSnapshot?.instagram ? Object.keys(auditRecord.snapshotJson.socialSnapshot.instagram) : [],
          
          // Performance
          hasPerformance: !!auditRecord?.snapshotJson?.performance,
          performanceKeys: auditRecord?.snapshotJson?.performance ? Object.keys(auditRecord.snapshotJson.performance) : [],
          performanceTotalPosts: auditRecord?.snapshotJson?.performance?.totalPosts || 0,
          performanceInstagramPosts: auditRecord?.snapshotJson?.performance?.instagramPosts || 0,
          
          // Sample media item (if exists)
          sampleMedia: auditRecord?.snapshotJson?.instagram?.media?.[0] ? {
            keys: Object.keys(auditRecord.snapshotJson.instagram.media[0]),
            hasLikeCount: 'like_count' in auditRecord.snapshotJson.instagram.media[0],
            hasCommentsCount: 'comments_count' in auditRecord.snapshotJson.instagram.media[0],
            hasEngagement: 'engagement' in auditRecord.snapshotJson.instagram.media[0],
            likeCount: auditRecord.snapshotJson.instagram.media[0].like_count,
            commentsCount: auditRecord.snapshotJson.instagram.media[0].comments_count
          } : null,
          
          // What we're actually reading
          currentlyReading: {
            instagramPostsFromCode: instagramPosts,
            tiktokVideos,
            youtubVideos,
            totalPosts,
            hasEngagement
          }
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
