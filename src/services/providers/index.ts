import { runRealAudit } from '../audit/index';
import { discovery } from '../discovery';
import { email } from '../email';
import { mediaPack } from '../mediaPack';
import { mockAuditService } from './mock/audit.mock';
import { mockDiscoveryService } from './mock/discovery.mock';
import { mockEmailService } from './mock/email.mock';
import { mockMediaPackService } from './mock/mediaPack.mock';
import { mockAIService } from './mock/ai.mock';
import { mockBrandsService } from './mock/brands.mock';
import { enhancedEmailService } from './real/enhancedEmail';
import { isFlagEnabled } from '../../lib/flags';
import { env, flag } from '@/lib/env';

// Real providers (production)
export const realProviders = {
  audit: runRealAudit,
  discovery: discovery.run,
  email: email.send,
  mediaPack: mediaPack.generate,
  ai: {
    analyzeProfile: async (profileSummary: string) => {
      // This would integrate with your real AI services
      const { aiAuditInsights } = await import('../ai/helpers');
      return await aiAuditInsights(profileSummary);
    },
    generateBrandMatches: async (auditData: any, brandHints?: string) => {
      // This would integrate with your real AI services
      const { aiReasonsFromAudit } = await import('../ai/helpers');
      const reasons = await aiReasonsFromAudit(auditData, brandHints);
      return reasons.map((reason, index) => ({
        brand: `AI Brand ${index + 1}`,
        score: 85 + Math.random() * 15,
        why: reason
      }));
    },
    generateEmailDraft: async (creator: string, brand: string, angle: string) => {
      // This would integrate with your real AI services
      const { aiEmailDraft } = await import('../ai/helpers');
      return await aiEmailDraft(creator, brand, angle);
    }
  },
  brands: {
    getBrandSuggestions: async (workspaceId: string, criteria: any) => {
      // This would integrate with your real brand services
      return {
        brands: [
          {
            id: 'real-brand-1',
            name: 'Real Tech Company',
            description: 'Real technology solutions',
            industry: 'Technology',
            matchScore: 95,
            reasons: ['Real data analysis', 'Market research', 'Audience insights']
          }
        ],
        totalResults: 1,
        searchCriteria: criteria
      };
    },
    getBrandDetails: async (brandId: string) => {
      // This would integrate with your real brand services
      return {
        id: brandId,
        name: 'Real Brand',
        description: 'Real brand description',
        industry: 'Technology',
        founded: '2020',
        employees: '100-500',
        headquarters: 'Real City, State'
      };
    },
    searchBrands: async (query: string, filters: any = {}) => {
      // This would integrate with your real brand services
      return {
        brands: [
          {
            id: 'real-search-1',
            name: 'Real Search Result',
            description: 'Real search result description',
            industry: 'Technology',
            matchScore: 90
          }
        ],
        totalResults: 1,
        query,
        filters
      };
    }
  }
};

// Mock providers (development/demo)
export const mockProviders = {
  audit: mockAuditService.runAudit,
  discovery: mockDiscoveryService.discoverBrands,
  email: mockEmailService.sendEmail,
  mediaPack: mockMediaPackService.generate,
  ai: mockAIService,
  brands: mockBrandsService
};

// Enhanced providers with feature flag gating
export const enhancedProviders = {
  // Feature flags for Epic 14
  features: {
    matchIntelligenceV3: async (workspaceId: string) => 
      await isFlagEnabled('match.intelligence.v3', workspaceId),
    matchReadinessSignals: async (workspaceId: string) => 
      await isFlagEnabled('match.readiness.signals', workspaceId),
    matchContinuousDiscovery: async (workspaceId: string) => 
      await isFlagEnabled('match.continuous.discovery', workspaceId),
  },
  
  audit: async (workspaceId: string, socialAccounts: string[] = []) => {
    // Always use real providers for Instagram integration
    console.error('🔴🔴🔴 PROVIDERS: AUDIT CALLED 🔴🔴🔴')
    console.error('🔴 Providers workspaceId:', workspaceId)
    console.error('🔴 Providers socialAccounts:', socialAccounts)
    console.error('🚀 Providers: Using REAL PROVIDERS (runRealAudit) - AI_AUDIT_V2 flag check removed')
    
    const result = await realProviders.audit(workspaceId, socialAccounts);
    console.error('🔴 Providers: Real audit returned:', result ? 'SUCCESS' : 'NULL')
    return result
  },

  discovery: async (workspaceId: string, criteria: any) => {
    // Check if AI_MATCH_V2 is enabled for this workspace
    if (await isFlagEnabled('AI_MATCH_V2', workspaceId)) {
      console.log('🚀 Using enhanced AI discovery');
      return await realProviders.discovery(workspaceId, criteria);
    } else {
      console.log('📝 Using standard discovery');
      return await mockProviders.discovery(workspaceId, criteria);
    }
  },

  email: async (params: any) => {
    // Check if OUTREACH_TONES is enabled for this workspace
    if (await isFlagEnabled('OUTREACH_TONES', params.workspaceId)) {
      console.log('🚀 Using enhanced email with tones');
      return await enhancedEmailService.send(params);
    } else {
      console.log('📝 Using standard email');
      return await mockProviders.email(params.to, params.subject, params.html);
    }
  },

  mediaPack: async (params: any) => {
    // Check if MEDIAPACK_V2 is enabled for this workspace
    if (await isFlagEnabled('MEDIAPACK_V2', params.workspaceId)) {
      console.log('🚀 Using enhanced media pack generation');
      return await realProviders.mediaPack(params);
    } else {
      console.log('📝 Using standard media pack generation');
      return await mockProviders.mediaPack(params);
    }
  },

  ai: {
    analyzeProfile: async (profileSummary: string, workspaceId?: string) => {
      if (workspaceId && await isFlagEnabled('AI_AUDIT_V2', workspaceId)) {
        console.log('🚀 Using enhanced AI profile analysis');
        return await realProviders.ai.analyzeProfile(profileSummary, workspaceId);
      } else {
        console.log('📝 Using mock AI profile analysis');
        return await mockProviders.ai.analyzeProfile(profileSummary);
      }
    },

    generateBrandMatches: async (auditData: any, brandHints?: string, workspaceId?: string) => {
      if (workspaceId && await isFlagEnabled('AI_MATCH_V2', workspaceId)) {
        console.log('🚀 Using enhanced AI brand matching');
        return await realProviders.ai.generateBrandMatches(auditData, brandHints, workspaceId);
      } else {
        console.log('📝 Using mock AI brand matching');
        return await mockProviders.ai.generateBrandMatches(auditData, brandHints);
      }
    },

    generateEmailDraft: async (creator: string, brand: string, angle: string, workspaceId?: string) => {
      if (workspaceId && await isFlagEnabled('OUTREACH_TONES', workspaceId)) {
        console.log('🚀 Using enhanced AI email generation');
        return await realProviders.ai.generateEmailDraft(creator, brand, angle, workspaceId);
      } else {
        console.log('📝 Using mock AI email generation');
        return await mockProviders.ai.generateEmailDraft(creator, brand, angle);
      }
    }
  },

  brands: {
    getBrandSuggestions: async (workspaceId: string, criteria: any) => {
      if (await isFlagEnabled('AI_MATCH_V2', workspaceId)) {
        console.log('🚀 Using enhanced brand suggestions');
        return await realProviders.brands.getBrandSuggestions(workspaceId, criteria);
      } else {
        console.log('📝 Using mock brand suggestions');
        return await mockProviders.brands.getBrandSuggestions(workspaceId, criteria);
      }
    },

    getBrandDetails: async (brandId: string, workspaceId?: string) => {
      if (workspaceId && await isFlagEnabled('AI_MATCH_V2', workspaceId)) {
        console.log('🚀 Using enhanced brand details');
        return await realProviders.brands.getBrandDetails(brandId);
      } else {
        console.log('📝 Using mock brand details');
        return await mockProviders.brands.getBrandDetails(brandId);
      }
    },

    searchBrands: async (query: string, filters: any = {}, workspaceId?: string) => {
      if (workspaceId && await isFlagEnabled('AI_MATCH_V2', workspaceId)) {
        console.log('🚀 Using enhanced brand search');
        return await realProviders.brands.searchBrands(query, filters);
      } else {
        console.log('📝 Using mock brand search');
        return await mockProviders.brands.searchBrands(query, filters);
      }
    }
  }
};

// Provider selection based on environment and feature flags
export function getProviders(workspace?: { featureFlags?: any } | string) {
  const isDemo = flag(env.DEMO_MODE);
  
  if (isDemo) {
    return mockProviders;
  }
  
  // If workspace object with featureFlags is provided, use enhanced providers with feature flag gating
  if (workspace && typeof workspace === 'object' && 'featureFlags' in workspace) {
    return enhancedProviders;
  }
  
  // If workspaceId string is provided, use enhanced providers (backward compatibility)
  if (typeof workspace === 'string') {
    return enhancedProviders;
  }
  
  // Fallback to real providers for backward compatibility
  return realProviders;
}

// Individual provider exports with feature flag support
export const auditProvider = (workspace?: { featureFlags?: any } | string) => 
  getProviders(workspace).audit;

export const discoveryProvider = (workspace?: { featureFlags?: any } | string) => 
  getProviders(workspace).discovery;

export const emailProvider = (workspace?: { featureFlags?: any } | string) => 
  getProviders(workspace).email;

export const mediaPackProvider = (workspace?: { featureFlags?: any } | string) => 
  getProviders(workspace).mediaPack;

export const aiProvider = (workspace?: { featureFlags?: any } | string) => 
  getProviders(workspace).ai;

export const brandsProvider = (workspace?: { featureFlags?: any } | string) => 
  getProviders(workspace).brands;
