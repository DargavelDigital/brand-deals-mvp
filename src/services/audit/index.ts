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

export async function runRealAudit(
  workspaceId: string, 
  socialAccounts?: string[],
  useFakeData: boolean = false
): Promise<AuditResult> {
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

    // Build unified social snapshot (or use fake data for admin testing)
    let snapshot: Snapshot;
    
    if (useFakeData && isAdmin) {
      // Admin testing mode - use fake account data
      const { FAKE_INSTAGRAM_SNAPSHOT } = await import('@/data/fakeAccountData');
      snapshot = FAKE_INSTAGRAM_SNAPSHOT as Snapshot;
      console.log('🎭 ADMIN: Using fake account data for testing');
    } else {
      // Normal mode - fetch real data
      snapshot = await buildSnapshot({
        workspaceId,
        youtube: undefined, // Not using YouTube in fake mode
      });
    }


    // Aggregate data from all connected platforms (or use fake data)
    let auditData;
    
    if (useFakeData && isAdmin) {
      // Use fake aggregated data for admin testing
      const { FAKE_AUDIT_DATA } = await import('@/data/fakeAccountData');
      auditData = FAKE_AUDIT_DATA;
      console.log('🎭 ADMIN: Using fake audit data');
    } else {
      // Normal mode - aggregate real data
      auditData = await aggregateAuditData(workspaceId);
      
      // CRITICAL FIX: If buildSnapshot() failed but aggregator succeeded, use aggregator data!
      if (!snapshot.instagram && auditData.sources.includes('INSTAGRAM')) {
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
        }
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
    
    
    // Generate insights using AI if available
    let insights: AuditInsightsOutput;
    try {
      console.log('🤖 Calling AI with snapshot and stageInfo...');
      console.log('🔍 Snapshot keys:', Object.keys(snapshot || {}));
      console.log('🔍 StageInfo:', stageInfo);
      
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
      console.log('🔍 AI Response Debug:', {
        hasCreatorProfile: !!insights.creatorProfile,
        hasBrandFitAnalysis: !!insights.brandFitAnalysis,
        hasContentAnalysis: !!insights.contentAnalysis,
        hasActionableStrategy: !!insights.actionableStrategy,
        hasNextMilestones: !!insights.nextMilestones,
        insightsKeys: Object.keys(insights || {}),
        fullInsights: JSON.stringify(insights, null, 2)
      });
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
      brandFitAnalysis: insights.brandFitAnalysis, // ✅ ADD NEW SCHEMA FIELD
      contentAnalysis: insights.contentAnalysis,   // ✅ ADD NEW SCHEMA FIELD
      actionableStrategy: insights.actionableStrategy, // ✅ ADD NEW SCHEMA FIELD
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
