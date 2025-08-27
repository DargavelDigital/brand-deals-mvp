import type { BrandCandidate, RankedBrand } from '@/types/match';
import { aiInvoke } from '@/ai/invoke';

export async function aiRankCandidates(
  auditSnapshot: any,
  candidates: BrandCandidate[],
  limit = 24
): Promise<RankedBrand[]> {
  if (!candidates.length) return [];
  const res = await aiInvoke('match.brandSearch.v1', {
    auditSnapshot,
    candidates,
    limit,
  }, { response: 'structured' });
  // Expect array of RankedBrand in strict JSON schema
  return res.results as RankedBrand[];
}
