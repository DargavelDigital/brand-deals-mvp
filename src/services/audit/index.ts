import { prisma } from '@/lib/prisma';
import { aggregateAuditData, NormalizedAuditData } from './aggregate';
import { generateInsights, AuditInsights } from './insights';
import { requireCredits } from '@/services/credits';
import { aiInvoke } from '@/services/ai/openai';
import { createTrace, logAIEvent, createAIEvent } from '@/lib/observability';

export interface AuditResult {
  auditId: string;
  audience: NormalizedAuditData['audience'];
  insights: string[];
  similarCreators: AuditInsights['similarCreators'];
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
    let insights;
    try {
      // Try to use AI-powered insights generation
      const aiResult = await aiInvoke(
        'audit_insights_generation',
        [
          { role: 'system', content: 'You are an expert social media analyst. Generate insights from audit data.' },
          { role: 'user', content: `Analyze this audit data and provide insights: ${JSON.stringify(auditData)}` }
        ],
        undefined, // No schema guard for now
        { workspaceId, auditType: 'comprehensive' }
      );

      if (aiResult.ok) {
        console.log('🤖 AI insights generated successfully');
        insights = {
          insights: [aiResult.data.insights || 'AI-generated insights'],
          similarCreators: aiResult.data.similarCreators || []
        };
      } else {
        console.log('⚠️ AI insights failed, falling back to standard insights');
        insights = generateInsights(auditData);
      }
    } catch (aiError) {
      console.log('⚠️ AI insights failed, falling back to standard insights:', aiError);
      insights = generateInsights(auditData);
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
          insights: insights.insights,
          similarCreators: insights.similarCreators
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
        insightsCount: insights.insights.length,
        aiUsed: insights.insights[0] === 'AI-generated insights'
      }
    );
    logAIEvent(auditEvent);

    return {
      auditId: audit.id,
      audience: auditData.audience,
      insights: insights.insights,
      similarCreators: insights.similarCreators,
      sources: auditData.sources
    };
  } catch (error) {
    console.error('Real audit failed:', error);
    
    // Log the audit failure
    if (typeof error === 'object' && error !== null) {
      const trace = createTrace();
      const errorMessage = error instanceof Error ? error.message : 
                          (error?.message || error?.toString?.() || 'Unknown error');
      const errorEvent = createAIEvent(
        trace,
        'audit_service',
        'audit_failure',
        undefined,
        { workspaceId, error: errorMessage }
      );
      logAIEvent(errorEvent);
    }
    
    throw new Error('Failed to complete audit');
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
