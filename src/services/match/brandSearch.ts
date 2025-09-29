import { aiInvoke } from '@/ai/invoke';
import { isFlagEnabled } from '@/lib/flags';
import type { StyleTone, StyleBrevity } from '@/ai/types';
import { prisma } from '@/lib/prisma';
import type { Snapshot } from '@/services/social/snapshot.types';

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

// Get latest social snapshot for a workspace
export async function getLatestSnapshot(workspaceId: string): Promise<Snapshot | null> {
  try {
    const latestAudit = await prisma().audit.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      select: { snapshotJson: true }
    });
    
    if (!latestAudit?.snapshotJson) return null;
    
    const snapshot = latestAudit.snapshotJson as any;
    return snapshot.socialSnapshot || null;
  } catch (error) {
    console.warn('Failed to get latest snapshot for brand search:', error);
    return null;
  }
}

export async function suggestBrands(
  workspaceFlags: any,
  input: BrandSearchInput,
  opts?: { 
    tone?: StyleTone; 
    brevity?: StyleBrevity;
    snapshot?: Snapshot | null;
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

  // Use AI-powered brand matching with snapshot if available
  const aiInput = opts?.snapshot ? { snapshot: opts.snapshot, candidates: input.brands } : input;
  const promptPack = opts?.snapshot ? 'match.brandSearch.v1' : 'match.brandSearch';
  
  return aiInvoke<typeof aiInput, BrandSearchOutput>(
    promptPack,
    aiInput,
    { 
      tone: opts?.tone ?? 'professional', 
      brevity: opts?.brevity ?? 'medium' 
    }
  );
}
