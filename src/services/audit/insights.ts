import { aiInvoke } from '@/ai/invoke';
import { isFlagEnabled } from '@/lib/flags';
import type { StyleTone, StyleBrevity } from '@/ai/types';
import { socials } from '@/config/socials';

export interface AuditInsightsInput {
  creator: {
    name: string;
    niche: string;
    country: string;
    followers?: number;
  };
  audit: {
    audience: {
      followers: number;
      topCountries: string[];
      age?: any;
    };
    content: {
      cadence: string;
      formats: string[];
      avgEngagement: number;
    };
  };
}

export interface AuditInsightsOutput {
  headline: string;
  keyFindings: string[];
  risks: string[];
  moves: Array<{ title: string; why: string }>;
}

export async function buildAuditInsights(
  workspaceFlags: any,
  input: AuditInsightsInput,
  opts?: { 
    tone?: StyleTone; 
    brevity?: StyleBrevity;
  }
): Promise<AuditInsightsOutput> {
  const useV2 = isFlagEnabled('AI_AUDIT_V2', workspaceFlags);
  
  if (!useV2) {
    // Fallback to basic insights if flag is off
    const keyFindings = [
      `Creator has ${input.audit.audience.followers.toLocaleString()} followers`,
      `Posts ${input.audit.content.cadence} with ${input.audit.content.avgEngagement}% engagement`,
      `Focuses on ${input.creator.niche} content`
    ];
    
    // Add platform-specific insights only if platforms are enabled
    if (socials.enabled('instagram')) {
      keyFindings.push('Strong Instagram presence with consistent engagement');
    }
    if (socials.enabled('tiktok')) {
      keyFindings.push('TikTok content shows viral potential');
    }
    if (socials.enabled('youtube')) {
      keyFindings.push('YouTube channel demonstrates strong subscriber loyalty');
    }
    
    return {
      headline: 'Creator Performance Analysis',
      keyFindings,
      risks: ['Limited data available for detailed analysis'],
      moves: [
        { title: 'Gather more audience data', why: 'Need deeper insights for strategic recommendations' },
        { title: 'Analyze content performance', why: 'Identify top-performing content patterns' },
        { title: 'Review engagement trends', why: 'Understand audience behavior over time' }
      ]
    };
  }

  // Use AI-powered insights
  return aiInvoke<AuditInsightsInput, AuditInsightsOutput>(
    'audit.insights',
    input,
    { 
      tone: opts?.tone ?? 'professional', 
      brevity: opts?.brevity ?? 'medium' 
    }
  );
}
