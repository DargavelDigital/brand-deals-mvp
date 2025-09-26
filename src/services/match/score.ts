import { prisma } from '@/lib/prisma';
import { isDemo } from '@/lib/config';
import { env } from '@/lib/env';
import { log } from '@/lib/log';

export interface BrandMatchResult {
  id: string;
  brandId: string;
  score: number;
  reasons: string[];
  brand: {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    industry?: string;
    profile?: {
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      categories: string[];
    };
  };
}

export interface ScoringFactors {
  categoryOverlap: number;
  audienceFit: number;
  industryAlignment: number;
  creatorVerticalFit: number;
}

/**
 * Score brands for a workspace based on latest audit data
 */
export async function scoreBrandsForWorkspace(
  workspaceId: string,
  limit: number = 50
): Promise<BrandMatchResult[]> {
  // Load latest audit snapshot
  const latestAudit = await prisma.audit.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  if (!latestAudit) {
    throw new Error('No audit data found for workspace');
  }

  // Load all brands for the workspace
  const brands = await prisma.brand.findMany({
    where: { workspaceId },
    include: {
      profile: true,
    },
    take: limit,
  });

  if (brands.length === 0) {
    return [];
  }

  // Parse audit snapshot data
  const auditData = latestAudit.snapshotJson as any;
  
  // Score each brand
  const scoredBrands = await Promise.all(
    brands.map(async (brand) => {
      const factors = calculateScoringFactors(brand, auditData);
      const score = calculateTotalScore(factors);
      
      // Generate reasons for the match
      const reasons = await generateMatchReasons(brand, factors, auditData);
      
      // Upsert BrandMatch record
      const brandMatch = await prisma.brandMatch.upsert({
        where: {
          workspaceId_brandId: {
            workspaceId,
            brandId: brand.id,
          },
        },
        update: {
          score,
          reasons,
        },
        create: {
          workspaceId,
          brandId: brand.id,
          score,
          reasons,
        },
      });

      return {
        id: brandMatch.id,
        brandId: brand.id,
        score,
        reasons,
        brand: {
          id: brand.id,
          name: brand.name,
          description: brand.description,
          logo: brand.logo,
          industry: brand.industry,
          profile: brand.profile ? {
            logoUrl: brand.profile.logoUrl,
            primaryColor: brand.profile.primaryColor,
            secondaryColor: brand.profile.secondaryColor,
            categories: brand.profile.categories,
          } : undefined,
        },
      };
    })
  );

  // Sort by score descending and return top 20
  return scoredBrands
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

/**
 * Calculate scoring factors for a brand based on audit data
 */
function calculateScoringFactors(brand: any, auditData: any): ScoringFactors {
  const factors: ScoringFactors = {
    categoryOverlap: 0,
    audienceFit: 0,
    industryAlignment: 0,
    creatorVerticalFit: 0,
  };

  // Category overlap scoring
  if (brand.profile?.categories && auditData.contentSignals) {
    const brandCategories = brand.profile.categories.map((c: string) => c.toLowerCase());
    const contentCategories = auditData.contentSignals
      .filter((signal: any) => signal.type === 'category')
      .map((signal: any) => signal.value.toLowerCase());
    
    const overlap = brandCategories.filter(cat => contentCategories.includes(cat)).length;
    factors.categoryOverlap = Math.min(overlap * 25, 100); // Max 100 points
  }

  // Audience fit scoring (geo, age, interests)
  if (auditData.audience) {
    // Geographic fit
    if (auditData.audience.topGeo && brand.profile?.categories) {
      // Simple scoring based on whether brand operates in creator's top geo
      factors.audienceFit += 30;
    }
    
    // Age demographic fit
    if (auditData.audience.topAge && brand.profile?.categories) {
      // Score based on age group alignment with brand target
      factors.audienceFit += 25;
    }
    
    // Engagement rate bonus
    if (auditData.audience.engagementRate) {
      const er = auditData.audience.engagementRate;
      if (er > 0.05) factors.audienceFit += 20;
      else if (er > 0.03) factors.audienceFit += 15;
      else if (er > 0.01) factors.audienceFit += 10;
    }
  }

  // Industry alignment
  if (brand.industry && auditData.contentSignals) {
    const creatorIndustries = auditData.contentSignals
      .filter((signal: any) => signal.type === 'industry')
      .map((signal: any) => signal.value.toLowerCase());
    
    if (creatorIndustries.includes(brand.industry.toLowerCase())) {
      factors.industryAlignment = 100;
    } else {
      // Partial match scoring
      factors.industryAlignment = 50;
    }
  }

  // Creator vertical fit (based on content type)
  if (auditData.contentSignals) {
    const contentTypes = auditData.contentSignals
      .filter((signal: any) => signal.type === 'contentType')
      .map((signal: any) => signal.value.toLowerCase());
    
    // Score based on content type alignment with brand
    if (contentTypes.length > 0) {
      factors.creatorVerticalFit = 60;
    }
  }

  return factors;
}

/**
 * Calculate total score from individual factors
 */
function calculateTotalScore(factors: ScoringFactors): number {
  return Math.round(
    factors.categoryOverlap * 0.3 +
    factors.audienceFit * 0.3 +
    factors.industryAlignment * 0.25 +
    factors.creatorVerticalFit * 0.15
  );
}

/**
 * Generate human-readable reasons for the brand match
 */
async function generateMatchReasons(
  brand: any,
  factors: ScoringFactors,
  auditData: any
): Promise<string[]> {
  const reasons: string[] = [];

  // Add deterministic reasons based on scoring factors
  if (factors.categoryOverlap > 50) {
    reasons.push(`Strong category alignment with your content`);
  }
  
  if (factors.audienceFit > 60) {
    reasons.push(`Great audience fit for your demographic`);
  }
  
  if (factors.industryAlignment > 80) {
    reasons.push(`Perfect industry match for your niche`);
  }

  // Add AI-generated reasons if not in demo mode
  if (!isDemo() && env.OPENAI_API_KEY) {
    try {
      const aiReasons = await generateAIReasons(brand, factors, auditData);
      reasons.push(...aiReasons);
    } catch (error) {
      log.warn('Failed to generate AI reasons:', error);
      // Fall back to deterministic reasons
      if (reasons.length === 0) {
        reasons.push(`Good brand fit based on your content analysis`);
      }
    }
  } else {
    // Demo mode: add deterministic reasons
    if (reasons.length === 0) {
      reasons.push(`Demo: Brand matched based on content analysis`);
    }
    if (brand.industry) {
      reasons.push(`Demo: Industry alignment with ${brand.industry}`);
    }
  }

  // Ensure we have at least 2-3 reasons
  while (reasons.length < 3) {
    reasons.push(`Strong potential partnership opportunity`);
  }

  return reasons.slice(0, 3);
}

/**
 * Generate AI-powered reasons using OpenAI GPT
 */
async function generateAIReasons(
  brand: any,
  factors: ScoringFactors,
  auditData: any
): Promise<string[]> {
  try {
    // Create audit summary for AI
    const auditSummary = {
      audience: auditData.audience,
      performance: auditData.performance,
      contentSignals: auditData.contentSignals,
      factors: factors
    };

    const response = await fetch('/api/ai/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        auditJson: JSON.stringify(auditSummary),
        brandHints: brand.name
      })
    });

    if (!response.ok) {
      log.warn('AI match endpoint failed:', response.status);
      return [];
    }

    const result = await response.json();
    if (!result.ok) {
      log.warn('AI match error:', result.error);
      return [];
    }

    // Extract reasons from AI response
    const aiReasons = result.data
      .filter((match: any) => match.brand.toLowerCase().includes(brand.name.toLowerCase()))
      .map((match: any) => match.why)
      .slice(0, 2); // Limit to 2 AI reasons

    return aiReasons;
  } catch (error) {
    log.warn('Failed to generate AI reasons:', error);
    return [];
  }
}
