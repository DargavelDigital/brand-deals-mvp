import type { Bias } from '@/services/ai/feedbackBias';

export interface MatchCandidate {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  matchScore?: number;
  distanceKm?: number;
  [key: string]: any;
}

export function reRank(
  candidates: MatchCandidate[],
  bias?: Bias
): MatchCandidate[] {
  if (!bias?.match || candidates.length === 0) {
    return candidates;
  }

  return [...candidates].sort((a, b) => {
    const score = (c: MatchCandidate): number => {
      let s = c.matchScore ?? 0;

      // Apply geo weight if available
      if (bias.match?.geoWeight && typeof c.distanceKm === 'number') {
        const geoBoost = (100 - Math.min(100, c.distanceKm)) * (bias.match.geoWeight - 1) * 0.1;
        s += geoBoost;
      }

      // Apply category boosts
      if (bias.match?.boostCategories && Array.isArray(c.tags)) {
        for (const tag of c.tags) {
          const boost = bias.match.boostCategories[tag.toLowerCase()];
          if (boost) {
            s *= boost;
          }
        }
      }

      // Apply downrank signals
      if (bias.match?.downrankSignals) {
        const text = (c.description ?? '').toLowerCase();
        for (const signal of bias.match.downrankSignals) {
          if (text.includes(signal)) {
            s -= 10; // Significant penalty for unwanted signals
          }
        }
      }

      return s;
    };

    return score(b) - score(a);
  });
}

// Helper to get re-ranking explanation for debugging
export function getReRankExplanation(
  candidate: MatchCandidate,
  bias?: Bias
): string[] {
  const explanations: string[] = [];

  if (!bias?.match) return explanations;

  // Geo weight explanation
  if (bias.match.geoWeight && typeof candidate.distanceKm === 'number') {
    const geoBoost = (100 - Math.min(100, candidate.distanceKm)) * (bias.match.geoWeight - 1) * 0.1;
    if (geoBoost > 0) {
      explanations.push(`Geo boost: +${geoBoost.toFixed(1)} (${candidate.distanceKm}km, weight: ${bias.match.geoWeight}x)`);
    }
  }

  // Category boost explanation
  if (bias.match.boostCategories && Array.isArray(candidate.tags)) {
    for (const tag of candidate.tags) {
      const boost = bias.match.boostCategories[tag.toLowerCase()];
      if (boost) {
        explanations.push(`Category boost: ${tag} ×${boost.toFixed(1)}`);
      }
    }
  }

  // Downrank explanation
  if (bias.match.downrankSignals) {
    const text = (candidate.description ?? '').toLowerCase();
    for (const signal of bias.match.downrankSignals) {
      if (text.includes(signal)) {
        explanations.push(`Downranked: contains "${signal}"`);
      }
    }
  }

  return explanations;
}
