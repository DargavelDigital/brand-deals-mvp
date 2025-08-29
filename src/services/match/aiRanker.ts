import { aiRankCandidates } from "@/ai/aiInvoke";
import { getProviders } from "@/services/providers";

export async function rankWithAI(auditSnapshot: any, candidates: any[], limit = 24, workspaceId?: string) {
  // Check if Epic 14 features are enabled
  const providers = getProviders(workspaceId || 'demo');
  const useEnhancedIntelligence = await providers.features?.matchIntelligenceV3?.(workspaceId || 'demo') || false;
  
  if (!useEnhancedIntelligence) {
    // Fallback to basic ranking
    return candidates.slice(0, limit).map((c, i) => ({
      id: c.id, 
      name: c.name, 
      score: 50 - i, 
      rationale: "Basic matching (Epic 14 not enabled)", 
      whyNow: "Contact for availability", 
      competitorsMentioned: [], 
      whatToPitch: "Standard partnership proposal", 
      fitDimensions: { 
        audienceGeo: 0.5, 
        audienceInterests: 0.5, 
        productAffinity: 0.5, 
        creatorPersona: 0.5, 
        budgetReadiness: 0.5 
      }
    }));
  }
  
  try {
    const input = { 
      auditSnapshot, 
      candidates, 
      limit, 
      nowIso: new Date().toISOString() 
    };
    const out = await aiRankCandidates(input, { packKey: "match.brandSearch.v1" });
    return out.results;
  } catch (error) {
    console.error('AI ranking failed, falling back to basic:', error);
    // Fallback to basic ranking on error
    return candidates.slice(0, limit).map((c, i) => ({
      id: c.id, 
      name: c.name, 
      score: 50 - i, 
      rationale: "AI ranking failed, using basic matching", 
      whyNow: "Contact for availability", 
      competitorsMentioned: [], 
      whatToPitch: "Standard partnership proposal", 
      fitDimensions: { 
        audienceGeo: 0.5, 
        audienceInterests: 0.5, 
        productAffinity: 0.5, 
        creatorPersona: 0.5, 
        budgetReadiness: 0.5 
      }
    }));
  }
}
