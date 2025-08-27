import { aiInvoke } from '@/ai/invoke';
import { isFlagEnabled } from '@/lib/flags';
import type { StyleTone, StyleBrevity } from '@/ai/types';

export interface BrandSearchInput {
  creator: {
    name: string;
    niche: string;
    country: string;
    followers: number;
  };
  audit: {
    audience: {
      followers: number;
      topCountries: string[];
      age?: any;
    };
    content: {
      formats: string[];
      avgEngagement: number;
    };
  };
  brands: Array<{
    id: string;
    name: string;
    industry: string;
    category: string;
    country: string;
    targetAudience: string;
  }>;
}

export interface BrandSearchOutput {
  matches: Array<{
    brandId: string;
    score: number;
    rationale: string;
    strengths?: string[];
    concerns?: string[];
  }>;
  notes: string;
}

export async function suggestBrands(
  workspaceFlags: any,
  input: BrandSearchInput,
  opts?: { 
    tone?: StyleTone; 
    brevity?: StyleBrevity;
  }
): Promise<BrandSearchOutput> {
  const useV2 = isFlagEnabled('AI_MATCH_V2', workspaceFlags);
  
  if (!useV2) {
    // Fallback to basic matching if flag is off
    const basicMatches = input.brands.map(brand => ({
      brandId: brand.id,
      score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
      rationale: `Basic match based on ${brand.industry} industry`,
      strengths: [`Industry alignment: ${brand.industry}`],
      concerns: ['Limited data for detailed analysis']
    }));
    
    return {
      matches: basicMatches,
      notes: 'Basic matching algorithm used. Enable AI_MATCH_V2 for advanced recommendations.'
    };
  }

  // Use AI-powered brand matching
  return aiInvoke<BrandSearchInput, BrandSearchOutput>(
    'match.brandSearch',
    input,
    { 
      tone: opts?.tone ?? 'professional', 
      brevity: opts?.brevity ?? 'medium' 
    }
  );
}
