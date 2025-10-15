import { prisma } from '@/lib/prisma';
import { aggregateAuditData, NormalizedAuditData } from './aggregate';
import { buildAuditInsights, AuditInsightsOutput } from './insights';
import { requireCredits } from '@/services/credits';
import { aiInvoke } from '@/ai/invoke';
import { createTrace, logAIEvent, createAIEvent } from '@/lib/observability';
import { buildSnapshot } from '@/services/social/snapshot.aggregator';
import type { Snapshot } from '@/services/social/snapshot.types';
import { nanoid } from 'nanoid';
import { detectCreatorStage, getStageSpecificPromptAdditions } from './stageDetection';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';

export interface AuditResult {
  auditId: string;
  audience: NormalizedAuditData['audience'];
  insights: string[];
  similarCreators: Array<{ name: string; description: string }>;
  sources: string[];
}

export async function runRealAudit(workspaceId: string, opts: { youtubeChannelId?: string } = {}): Promise<AuditResult> {
  // Check if user is admin (for AI usage tracking bypass)
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.isAdmin || false;
  
  if (isAdmin) {
    console.log('🔓 Admin running audit - unlimited access, no tracking');
  }
  
  // Check credits (admins bypass this in requireCredits function)
  await requireCredits('AUDIT', 1, workspaceId);

  try {
    // Create trace for this audit operation
    const trace = createTrace();
    console.log(`🔍 Starting audit with trace: ${trace.traceId}`);

    // Build unified social snapshot (with cache) - THIS HAS THE RAW POSTS!
    const snapshot: Snapshot = await buildSnapshot({
      workspaceId,
      youtube: opts.youtubeChannelId ? { channelId: opts.youtubeChannelId } : undefined,
    });

    // DEBUG 1: After buildSnapshot()
    console.error('🔴 SNAPSHOT FROM buildSnapshot:', {
      hasInstagram: !!snapshot.instagram,
      instagramPosts: snapshot.instagram?.posts?.length || 0,
      snapshotKeys: Object.keys(snapshot)
    });
    
    // DEBUG 2: Log FULL snapshot object
    console.error('🔴 FULL SNAPSHOT:', JSON.stringify(snapshot, null, 2));

    // Aggregate data from all connected platforms
    console.error('🔴🔴🔴 AUDIT: CALLING AGGREGATOR 🔴🔴🔴')
    console.error('🔴 Audit workspaceId:', workspaceId)
    const auditData = await aggregateAuditData(workspaceId);
    console.error('🔴 Audit: Aggregator returned data:', {
      sources: auditData.sources,
      totalFollowers: auditData.audience?.totalFollowers,
      avgEngagement: auditData.performance?.avgEngagement,
      insightsCount: auditData.insights?.length
    })
    
    // CRITICAL FIX: If buildSnapshot() failed but aggregator succeeded, use aggregator data!
    if (!snapshot.instagram && auditData.sources.includes('INSTAGRAM')) {
      console.error('🔴 FIX: buildSnapshot had no Instagram, but aggregator has it! Merging aggregator data...');
      
      // Fetch the raw Instagram data that aggregator already got
      const { InstagramProvider } = await import('./providers/instagram');
      const igData = await InstagramProvider.fetchAccountMetrics(workspaceId);
      
      if (igData && igData.posts) {
        snapshot.instagram = {
          posts: igData.posts || [],  // Raw posts from aggregator
          username: igData.username || '',
          followers: igData.followers || 0,
          avgEngagementRate: igData.audience?.engagementRate || 0,
          igUserId: igData.igUserId || ''
        };
        console.error('🔴 ✅ Instagram data merged from aggregator!', {
          posts: snapshot.instagram.posts.length,
          followers: snapshot.instagram.followers,
          username: snapshot.instagram.username
        });
      } else {
        console.error('🔴 ❌ Aggregator also has no posts!');
      }
    }
    
    // Detect creator stage for adaptive analysis
    const totalPosts = (snapshot.instagram?.posts?.length || 0) + 
                       (snapshot.tiktok?.videos?.length || 0) + 
                       (snapshot.youtube?.videos?.length || 0)
    
    const stageInfo = detectCreatorStage({
      totalFollowers: auditData.audience?.totalFollowers || 0,
      totalPosts,
      avgEngagement: auditData.audience?.avgEngagement
    })
    
    console.error('🔴 CREATOR STAGE DETECTED:', stageInfo)
    
    // Generate insights using AI if available
    let insights: AuditInsightsOutput;
    try {
      // Log EXACT data being sent to GPT-5
      console.error('🔴🔴🔴 DATA SENT TO GPT-5:', JSON.stringify({ snapshot, stageInfo }, null, 2));
      console.error('🔴🔴🔴 SNAPSHOT KEYS:', Object.keys(snapshot));
      console.error('🔴🔴🔴 INSTAGRAM DATA IN SNAPSHOT:', snapshot.instagram ? 'EXISTS' : 'MISSING');
      if (snapshot.instagram) {
        console.error('🔴🔴🔴 INSTAGRAM PROFILE:', snapshot.instagram);
        console.error('🔴🔴🔴 INSTAGRAM POSTS COUNT:', snapshot.instagram.posts?.length || 0);
        console.error('🔴🔴🔴 INSTAGRAM FOLLOWERS:', snapshot.instagram.followers || 0);
      }
      console.error('🔴🔴🔴 TIKTOK DATA IN SNAPSHOT:', snapshot.tiktok ? 'EXISTS' : 'MISSING');
      console.error('🔴🔴🔴 YOUTUBE DATA IN SNAPSHOT:', snapshot.youtube ? 'EXISTS' : 'MISSING');
      
      // Try to use AI-powered insights generation with social snapshot AND stage info
      insights = await aiInvoke<unknown, AuditInsightsOutput>(
        'audit.insights',
        { snapshot, stageInfo },
        { 
          workspaceId,  // Pass workspaceId for proper AI usage logging
          isAdmin       // Skip AI usage tracking for admins
        }
      );

      console.log('🤖 AI insights generated successfully');
    } catch (aiError) {
      console.log('⚠️ AI insights failed, falling back to standard insights:', aiError);
      insights = await buildAuditInsights({}, {
        creator: {
          name: 'Creator',
          niche: 'Social Media',
          country: 'Unknown'
        },
        audit: {
          audience: {
            followers: auditData.audience?.totalFollowers || 0,
            topCountries: auditData.audience?.topCountries || [],
            age: auditData.audience?.ageDistribution
          },
          content: {
            cadence: 'Regular',
            formats: ['Posts'],
            avgEngagement: auditData.performance?.avgEngagement || 0
          }
        }
      });
    }
    
    // CRITICAL DEBUG: Log EXACT snapshot structure before save
    console.log('🔴🔴🔴 SNAPSHOT OBJECT STRUCTURE:');
    console.log('  - Type:', typeof snapshot);
    console.log('  - Keys:', Object.keys(snapshot || {}));
    console.log('  - Has instagram?:', !!snapshot.instagram);
    console.log('  - Has derived?:', !!snapshot.derived);
    
    if (snapshot.instagram) {
      console.log('  - instagram keys:', Object.keys(snapshot.instagram));
      console.log('  - instagram.posts?:', Array.isArray(snapshot.instagram.posts));
      console.log('  - instagram.posts.length:', snapshot.instagram.posts?.length || 0);
      console.log('  - instagram.username:', snapshot.instagram.username);
      console.log('  - instagram.followers:', snapshot.instagram.followers);
    } else {
      console.log('  - ❌ NO INSTAGRAM DATA IN SNAPSHOT!');
    }
    
    const snapshotJsonToSave = {
      // AI Analysis (for display)
      audience: auditData.audience,
      performance: auditData.performance,
      contentSignals: auditData.contentSignals,
      insights: [
        insights.headline, 
        ...(Array.isArray(insights.keyFindings) ? insights.keyFindings : [])
      ].filter(Boolean),
      similarCreators: Array.isArray(insights.moves) 
        ? insights.moves.map(move => ({ name: move.title, description: move.why }))
        : [],
      
      // Enhanced v2/v3 fields
      stageInfo,
      stageMessage: insights.stageMessage,
      creatorProfile: insights.creatorProfile,
      strengthAreas: insights.strengthAreas || [],
      growthOpportunities: insights.growthOpportunities || [],
      nextMilestones: insights.nextMilestones || [],
      brandFit: insights.brandFit,
      immediateActions: insights.immediateActions || [],
      strategicMoves: insights.strategicMoves || [],
      
      // RAW SOCIAL DATA (for brand matching!) ← THIS IS CRITICAL!
      socialSnapshot: snapshot  // Contains instagram.posts, tiktok.videos, youtube.videos
    };
    
    console.log('🔴🔴🔴 snapshotJson BEFORE save:');
    console.log('  - Has socialSnapshot?:', !!snapshotJsonToSave.socialSnapshot);
    console.log('  - socialSnapshot type:', typeof snapshotJsonToSave.socialSnapshot);
    console.log('  - socialSnapshot keys:', Object.keys(snapshotJsonToSave.socialSnapshot || {}));
    console.log('  - socialSnapshot.instagram?:', !!snapshotJsonToSave.socialSnapshot?.instagram);
    console.log('  - socialSnapshot.derived?:', !!snapshotJsonToSave.socialSnapshot?.derived);

    // Store audit snapshot in database
    const audit = await prisma().audit.create({
      data: {
        id: nanoid(),  // Required primary key
        workspaceId,
        sources: auditData.sources,
        snapshotJson: snapshotJsonToSave
      }
    });

    // DEBUG 4: After saving to database
    console.error('🔴 AFTER SAVE - Reading back:', {
      auditId: audit.id,
      socialSnapshotKeys: Object.keys((audit.snapshotJson as any)?.socialSnapshot || {}),
      hasInstagram: !!(audit.snapshotJson as any)?.socialSnapshot?.instagram,
      instagramPostsInDB: (audit.snapshotJson as any)?.socialSnapshot?.instagram?.posts?.length || 0
    });

    // Log the successful audit completion
    const auditEvent = createAIEvent(
      trace,
      'audit_service',
      'audit_completion',
      undefined,
      { 
        workspaceId, 
        auditId: audit.id, 
        sources: auditData.sources.length,
        insightsCount: (Array.isArray(insights.keyFindings) ? insights.keyFindings.length : 0) + 1,
        aiUsed: insights.headline !== 'Creator Performance Analysis'
      }
    );
    logAIEvent(auditEvent);

    return {
      auditId: audit.id,
      audience: auditData.audience,
      insights: [
        insights.headline,
        ...(Array.isArray(insights.keyFindings) ? insights.keyFindings : [])
      ].filter(Boolean),  // FILTER OUT ALL UNDEFINED/NULL VALUES
      similarCreators: Array.isArray(insights.moves) 
        ? insights.moves.map(move => ({ name: move.title, description: move.why }))
        : [],
      sources: auditData.sources
    };
  } catch (error) {
    console.error('Real audit failed:', error);
    
    // Log the audit failure
    if (typeof error === 'object' && error !== null) {
      const trace = createTrace();
      const errorMessage = error instanceof Error ? error.message : 
                          (error as any)?.message || (error as any)?.toString?.() || 'Unknown error';
      
      const errorEvent = createAIEvent(
        trace,
        'audit_service',
        'audit_failure',
        undefined,
        { workspaceId, error: errorMessage }
      );
      logAIEvent(errorEvent);
    }
    
    throw error;
  }
}

export async function getLatestAudit(workspaceId: string): Promise<AuditResult | null> {
  try {
    const latestAudit = await prisma().audit.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestAudit) {
      return null;
    }

    const snapshot = latestAudit.snapshotJson as any;
    
    return {
      auditId: latestAudit.id,
      audience: snapshot.audience,
      insights: snapshot.insights,
      similarCreators: snapshot.similarCreators,
      sources: latestAudit.sources
    };
  } catch (error) {
    console.error('Failed to get latest audit:', error);
    return null;
  }
}
