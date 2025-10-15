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

export interface AuditResult {
  auditId: string;
  audience: NormalizedAuditData['audience'];
  insights: string[];
  similarCreators: Array<{ name: string; description: string }>;
  sources: string[];
}

export async function runRealAudit(workspaceId: string, opts: { youtubeChannelId?: string } = {}): Promise<AuditResult> {
  // Check credits
  await requireCredits('AUDIT', 1, workspaceId);

  try {
    // Create trace for this audit operation
    const trace = createTrace();
    console.log(`🔍 Starting audit with trace: ${trace.traceId}`);

    // Build unified social snapshot (with cache)
    const snapshot: Snapshot = await buildSnapshot({
      workspaceId,
      youtube: opts.youtubeChannelId ? { channelId: opts.youtubeChannelId } : undefined,
    });

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
        { workspaceId }  // Pass workspaceId for proper AI usage logging
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
    
    // Store audit snapshot in database
    const audit = await prisma().audit.create({
      data: {
        id: nanoid(),  // Required primary key
        workspaceId,
        sources: auditData.sources,
        snapshotJson: {
          audience: auditData.audience,
          performance: auditData.performance,
          contentSignals: auditData.contentSignals,
          insights: [
            insights.headline, 
            ...(Array.isArray(insights.keyFindings) ? insights.keyFindings : [])
          ].filter(Boolean),  // FILTER OUT ALL UNDEFINED/NULL VALUES
          similarCreators: Array.isArray(insights.moves) 
            ? insights.moves.map(move => ({ name: move.title, description: move.why }))
            : [],
          
          // Enhanced v2/v3 fields
          stageInfo,  // Store stage info
          stageMessage: insights.stageMessage,
          creatorProfile: insights.creatorProfile,
          strengthAreas: insights.strengthAreas || [],
          growthOpportunities: insights.growthOpportunities || [],
          nextMilestones: insights.nextMilestones || [],
          brandFit: insights.brandFit,
          immediateActions: insights.immediateActions || [],
          strategicMoves: insights.strategicMoves || [],
          
          socialSnapshot: snapshot // Add the new social snapshot
        }
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
