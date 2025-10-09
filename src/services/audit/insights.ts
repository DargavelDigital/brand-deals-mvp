import { aiInvoke } from '@/ai/invoke';
import { isFlagEnabled } from '@/lib/flags';
import type { StyleTone, StyleBrevity } from '@/ai/types';

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
  risks?: string[];  // Optional for backwards compatibility
  moves?: Array<{ title: string; why: string }>;  // Optional for backwards compatibility
  
  // Enhanced v2 fields
  creatorProfile?: {
    primaryNiche: string;
    contentStyle: string;
    topContentThemes: string[];
    audiencePersona: string;
    uniqueValue: string;
  };
  strengthAreas?: string[];
  growthOpportunities?: string[];
  brandFit?: {
    idealIndustries: string[];
    productCategories: string[];
    brandTypes: string[];
    audienceDemographics: {
      primaryAgeRange: string;
      genderSkew: string;
      topGeoMarkets: string[];
    };
    audienceInterests: string[];
    partnershipStyle: string;
    estimatedCPM: string;
    partnershipReadiness: string;
  };
  immediateActions?: Array<{
    action: string;
    impact: string;
    timeframe: string;
  }>;
  strategicMoves?: Array<{
    title: string;
    why: string;
    expectedOutcome: string;
  }>;
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
    return {
      headline: 'Creator Performance Analysis',
      keyFindings: [
        `Creator has ${input.audit.audience.followers.toLocaleString()} followers`,
        `Posts ${input.audit.content.cadence} with ${input.audit.content.avgEngagement}% engagement`,
        `Focuses on ${input.creator.niche} content`
      ],
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
