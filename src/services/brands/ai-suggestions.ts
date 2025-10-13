/**
 * AI Brand Suggestions Service
 * 
 * Uses AI to suggest real brands (international, national, local) based on creator's audit data.
 * This is a fallback when Google Places/Yelp APIs are not configured.
 */

import { aiInvoke } from '@/ai/invoke';
import type { 
  BrandSuggestionsInput, 
  BrandSuggestionsOutput 
} from '@/ai/promptPacks/brand.suggestions.v1';

/**
 * Audit snapshot structure (from database)
 */
export interface AuditSnapshot {
  audience?: {
    totalFollowers?: number;
    size?: number;
    topGeo?: string[];
    topLocations?: string[];
    interests?: string[];
    avgEngagement?: number;
    engagementRate?: number;
  };
  brandFit?: {
    idealIndustries?: string[];
    productCategories?: string[];
    brandTypes?: string[];
    audienceDemographics?: {
      primaryAgeRange?: string;
      genderSkew?: string;
      topGeoMarkets?: string[];
    };
    audienceInterests?: string[];
    partnershipStyle?: string;
    estimatedCPM?: string;
    partnershipReadiness?: string;
  };
  creatorProfile?: {
    primaryNiche?: string;
    contentStyle?: string;
    topContentThemes?: string[];
    audiencePersona?: string;
    uniqueValue?: string;
  };
  contentSignals?: string[];
  sources?: string[];
  socialSnapshot?: {
    instagram?: {
      profile?: {
        username?: string;
        full_name?: string;
        biography?: string;
      };
      followers?: number;
      location?: string;
    };
    tiktok?: any;
    youtube?: any;
  };
}

/**
 * Brand suggestions result
 */
export interface BrandSuggestions {
  international: Array<{
    name: string;
    industry: string;
    website: string;
    why_good_fit: string;
    estimated_budget: string;
  }>;
  national: Array<{
    name: string;
    industry: string;
    website: string;
    why_good_fit: string;
    estimated_budget: string;
  }>;
  local: Array<{
    name: string;
    industry: string;
    website: string;
    why_good_fit: string;
    estimated_budget: string;
  }>;
}

/**
 * Extract creator location from audit snapshot
 */
function extractLocation(auditSnapshot: AuditSnapshot): { country: string; city: string; region?: string } {
  // Try to get location from brandFit audienceDemographics
  const topGeoMarkets = auditSnapshot.brandFit?.audienceDemographics?.topGeoMarkets || [];
  
  // Try to get from audience data
  const topLocations = auditSnapshot.audience?.topGeo || auditSnapshot.audience?.topLocations || [];
  
  // Try Instagram profile location
  const instagramLocation = auditSnapshot.socialSnapshot?.instagram?.location;
  
  // Combine all location sources
  const allLocations = [...topGeoMarkets, ...topLocations];
  
  // Extract country (first location is usually country)
  let country = 'Unknown';
  let city = 'Unknown';
  let region: string | undefined;
  
  if (allLocations.length > 0) {
    // First location is usually the country
    country = allLocations[0] || 'Unknown';
    
    // Second location might be city
    if (allLocations.length > 1) {
      city = allLocations[1] || 'Unknown';
    }
    
    // Third location might be region/state
    if (allLocations.length > 2) {
      region = allLocations[2];
    }
  }
  
  // If we have Instagram location, use it for city
  if (instagramLocation) {
    city = instagramLocation;
  }
  
  return { country, city, region };
}

/**
 * Extract creator name from audit snapshot
 */
function extractCreatorName(auditSnapshot: AuditSnapshot): string {
  // Try Instagram profile name
  const instagramName = auditSnapshot.socialSnapshot?.instagram?.profile?.full_name 
    || auditSnapshot.socialSnapshot?.instagram?.profile?.username;
  
  if (instagramName) {
    return instagramName;
  }
  
  return 'Creator';
}

/**
 * Suggest brands from audit data using AI
 * 
 * @param auditSnapshot - Latest audit snapshot with creator data
 * @returns Brand suggestions (international, national, local) or empty if AI fails
 */
export async function suggestBrandsFromAudit(
  auditSnapshot: AuditSnapshot
): Promise<BrandSuggestions> {
  try {
    // Extract creator profile data
    const creatorName = extractCreatorName(auditSnapshot);
    const niche = auditSnapshot.creatorProfile?.primaryNiche || 'Social Media';
    const location = extractLocation(auditSnapshot);
    const followers = auditSnapshot.audience?.totalFollowers || auditSnapshot.audience?.size || 0;
    
    // Extract content themes
    const contentThemes = auditSnapshot.creatorProfile?.topContentThemes 
      || auditSnapshot.contentSignals 
      || ['Social content'];
    
    // Extract audience interests
    const audienceInterests = auditSnapshot.brandFit?.audienceInterests 
      || auditSnapshot.audience?.interests 
      || [];
    
    // Extract top locations for audience
    const topLocations = auditSnapshot.brandFit?.audienceDemographics?.topGeoMarkets 
      || auditSnapshot.audience?.topGeo 
      || auditSnapshot.audience?.topLocations 
      || [];
    
    // Extract age demographics
    const ageDemographics = auditSnapshot.brandFit?.audienceDemographics?.primaryAgeRange 
      ? [auditSnapshot.brandFit.audienceDemographics.primaryAgeRange]
      : ['18-34'];
    
    console.log('🤖 AI Brand Suggestions - Input:', {
      creatorName,
      niche,
      location,
      followers,
      contentThemes: contentThemes.slice(0, 3),
      audienceInterests: audienceInterests.slice(0, 3)
    });
    
    // Build AI input
    const input: BrandSuggestionsInput = {
      creatorProfile: {
        name: creatorName,
        niche,
        location,
        followers
      },
      auditData: {
        contentThemes: Array.isArray(contentThemes) ? contentThemes : [contentThemes],
        audienceInterests: Array.isArray(audienceInterests) ? audienceInterests : [],
        topLocations: Array.isArray(topLocations) ? topLocations : [],
        ageDemographics: Array.isArray(ageDemographics) ? ageDemographics : ['18-34']
      }
    };
    
    // Call AI brand suggestions
    const suggestions = await aiInvoke<BrandSuggestionsInput, BrandSuggestionsOutput>(
      'brand.suggestions',
      input
    );
    
    console.log('✅ AI Brand Suggestions - Success:', {
      international: suggestions.international?.length || 0,
      national: suggestions.national?.length || 0,
      local: suggestions.local?.length || 0
    });
    
    return suggestions;
    
  } catch (error) {
    console.error('❌ AI Brand Suggestions - Error:', error);
    
    // Return empty suggestions if AI fails (graceful degradation)
    return {
      international: [],
      national: [],
      local: []
    };
  }
}

/**
 * Check if audit snapshot has sufficient data for brand suggestions
 */
export function hasMinimalDataForSuggestions(auditSnapshot: AuditSnapshot): boolean {
  // Need at least one of these to make meaningful suggestions
  const hasNiche = !!auditSnapshot.creatorProfile?.primaryNiche;
  const hasContentThemes = (auditSnapshot.creatorProfile?.topContentThemes?.length || 0) > 0 
    || (auditSnapshot.contentSignals?.length || 0) > 0;
  const hasAudienceInterests = (auditSnapshot.brandFit?.audienceInterests?.length || 0) > 0 
    || (auditSnapshot.audience?.interests?.length || 0) > 0;
  const hasLocation = (auditSnapshot.brandFit?.audienceDemographics?.topGeoMarkets?.length || 0) > 0
    || (auditSnapshot.audience?.topGeo?.length || 0) > 0
    || (auditSnapshot.audience?.topLocations?.length || 0) > 0;
  
  // Need niche/themes AND (interests OR location)
  return (hasNiche || hasContentThemes) && (hasAudienceInterests || hasLocation);
}

