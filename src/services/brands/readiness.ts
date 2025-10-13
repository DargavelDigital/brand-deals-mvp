import { getProviders } from '@/services/providers';

export interface ReadinessSignals {
  jobs: number;
  press: boolean;
  ads: number;
}

export interface ReadinessScore {
  score: number;
  signals: ReadinessSignals;
}

/**
 * Fetch job posts for a domain to assess hiring activity
 * TODO: Implement LinkedIn/Indeed scraping
 */
export async function fetchJobPosts(domain: string): Promise<number> {
  try {
    // Not implemented yet - return 0 (no fake data)
    return 0;
  } catch (error) {
    console.error('Failed to fetch job posts for', domain, error);
    return 0;
  }
}

/**
 * Check for recent press mentions, funding, or launches
 * TODO: Implement press monitoring (Google News API, press release aggregators)
 */
export async function fetchPress(domain: string): Promise<boolean> {
  try {
    // Not implemented yet - return false (no fake data)
    return false;
  } catch (error) {
    console.error('Failed to fetch press for', domain, error);
    return false;
  }
}

/**
 * Check for active advertising presence
 * TODO: Implement Meta Ads Library / Google Ads API checking
 */
export async function fetchAds(domain: string): Promise<number> {
  try {
    // Not implemented yet - return 0 (no fake data)
    return 0;
  } catch (error) {
    console.error('Failed to fetch ads for', domain, error);
    return 0;
  }
}

/**
 * Compute overall readiness score based on signals
 */
export function computeReadiness(signals: ReadinessSignals): number {
  const { jobs, press, ads } = signals;
  
  // Weighted scoring:
  // - Jobs: 40% (hiring = growth)
  // - Press: 30% (recent activity = momentum)
  // - Ads: 30% (marketing spend = investment)
  
  const jobsScore = Math.min(jobs / 10, 1) * 40; // Cap at 10+ jobs
  const pressScore = press ? 30 : 0;
  const adsScore = Math.min(ads / 20, 1) * 30; // Cap at 20+ ads
  
  return Math.round(jobsScore + pressScore + adsScore);
}

/**
 * Get readiness assessment for a domain
 */
export async function getReadiness(domain: string): Promise<ReadinessScore> {
  const providers = getProviders('demo'); // TODO: Get from context
  
  if (!providers.features.matchReadinessSignals) {
    return {
      score: 50,
      signals: { jobs: 0, press: false, ads: 0 }
    };
  }
  
  const [jobs, press, ads] = await Promise.all([
    fetchJobPosts(domain),
    fetchPress(domain),
    fetchAds(domain)
  ]);
  
  const signals: ReadinessSignals = { jobs, press, ads };
  const score = computeReadiness(signals);
  
  return { score, signals };
}
