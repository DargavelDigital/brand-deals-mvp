import type { BrandCandidate, RankedBrand } from '@/types/match';
import { aiInvoke } from '@/ai/invoke';
import { getReadiness } from '@/services/brands/readiness';
import { getProviders } from '@/services/providers';
import { log } from '@/lib/log';

export async function aiRankCandidates(
  auditSnapshot: any,
  candidates: BrandCandidate[],
  limit = 24,
  workspaceId?: string
): Promise<RankedBrand[]> {
  if (!candidates.length) return [];
  
  // Check if Epic 14 features are enabled
  const providers = getProviders(workspaceId || 'demo');
  const useEnhancedIntelligence = providers.features.matchIntelligenceV3;
  
  // Call AI with enhanced prompt if enabled
  const promptPack = useEnhancedIntelligence ? 'match.brandSearch.v2' : 'match.brandSearch.v1';
  
  const res = await aiInvoke(promptPack, {
    auditSnapshot,
    candidates,
    limit,
    enhancedIntelligence: useEnhancedIntelligence,
  }, { response: 'structured' });
  
  let results = res.results as RankedBrand[];
  
  // If Epic 14 is enabled, enhance with readiness signals
  if (useEnhancedIntelligence && providers.features.matchReadinessSignals) {
    results = await Promise.all(
      results.map(async (brand) => {
        if (brand.domain) {
          try {
            const readiness = await getReadiness(brand.domain);
            return {
              ...brand,
              readiness
            };
          } catch (error) {
            log.error('Failed to get readiness for', brand.domain, error);
            return brand;
          }
        }
        return brand;
      })
    );
  }
  
  return results;
}
