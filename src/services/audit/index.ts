import { prisma } from '@/lib/prisma';
import { aggregateAuditData, NormalizedAuditData } from './aggregate';
import { buildAuditInsights, AuditInsightsOutput } from './insights';
import { requireCredits } from '@/services/credits';
import { aiInvoke } from '@/ai/invoke';
import { createTrace, logAIEvent, createAIEvent } from '@/lib/observability';

export interface AuditResult {
  auditId: string;
  audience: NormalizedAuditData['audience'];
  insights: string[];
  similarCreators: Array<{ name: string; description: string }>;
  sources: string[];
}

export async function runRealAudit(workspaceId: string): Promise<AuditResult> {
  // Check credits
  await requireCredits('AUDIT', 1, workspaceId);

  try {
    // Create trace for this audit operation
    const trace = createTrace();
    console.log(`🔍 Starting audit with trace: ${trace.traceId}`);

    // Aggregate data from all connected platforms
    const auditData = await aggregateAuditData(workspaceId);
    
    // Generate insights using AI if available
    let insights: AuditInsightsOutput;
    try {
      // Try to use AI-powered insights generation
      insights = await aiInvoke<unknown, AuditInsightsOutput>(
        'audit.insights',
        {
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
    
    // Store audit snapshot in database
    const audit = await prisma.audit.create({
      data: {
        workspaceId,
        sources: auditData.sources,
        snapshotJson: {
          audience: auditData.audience,
          performance: auditData.performance,
          contentSignals: auditData.contentSignals,
          insights: [insights.headline, ...insights.keyFindings],
          similarCreators: insights.moves.map(move => ({ name: move.title, description: move.why }))
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
        insightsCount: insights.keyFindings.length + 1,
        aiUsed: insights.headline !== 'Creator Performance Analysis'
      }
    );
    logAIEvent(auditEvent);

    return {
      auditId: audit.id,
      audience: auditData.audience,
      insights: [insights.headline, ...insights.keyFindings],
      similarCreators: insights.moves.map(move => ({ name: move.title, description: move.why })),
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
    const latestAudit = await prisma.audit.findFirst({
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
