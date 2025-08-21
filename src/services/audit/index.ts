import { prisma } from '@/lib/prisma';
import { aggregateAuditData, NormalizedAuditData } from './aggregate';
import { generateInsights, AuditInsights } from './insights';
import { requireCredits } from '@/services/credits';

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
    // Aggregate data from all connected platforms
    const auditData = await aggregateAuditData(workspaceId);
    
    // Generate insights
    const insights = generateInsights(auditData);
    
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

    return {
      auditId: audit.id,
      audience: auditData.audience,
      insights: insights.insights,
      similarCreators: insights.similarCreators,
      sources: auditData.sources
    };
  } catch (error) {
    console.error('Real audit failed:', error);
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
