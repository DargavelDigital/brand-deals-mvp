import { describe, it, expect, beforeEach, vi } from 'vitest';
import { computeBias, hardToneOverride, getRecentDownRate } from '@/services/ai/feedbackBias';
import { reRank, getReRankExplanation } from '@/components/matches/reRank';
import { isOn } from '@/config/flags';

// Mock Prisma
vi.mock('@/prisma/client', () => ({
  prisma: {
    aiFeedback: {
      findMany: vi.fn(),
    },
  },
}));

// Mock the flags
vi.mock('@/config/flags', () => ({
  isOn: vi.fn(),
}));

describe('AI Adaptation System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feedback Bias Computation', () => {
    it('should compute outreach bias from feedback', async () => {
      const mockFeedback = [
        {
          type: 'OUTREACH',
          decision: 'UP',
          comment: 'Great professional tone, love the clear CTA',
          targetId: 'email_1',
          createdAt: new Date(),
        },
        {
          type: 'OUTREACH',
          decision: 'DOWN',
          comment: 'Too casual for business audience, needs more formal language',
          targetId: 'email_2',
          createdAt: new Date(),
        },
        {
          type: 'OUTREACH',
          decision: 'UP',
          comment: 'Perfect balance of professional and friendly',
          targetId: 'email_3',
          createdAt: new Date(),
        },
      ];

      const { prisma } = await import('@/prisma/client');
      vi.mocked(prisma.aiFeedback.findMany).mockResolvedValue(mockFeedback as any);

      const bias = await computeBias('workspace_123');

      expect(bias.outreach).toBeDefined();
      expect(bias.outreach?.toneBias).toBe('professional');
      expect(bias.outreach?.do).toContain('professional');
      expect(bias.outreach?.do).toContain('clear');
      expect(bias.outreach?.dont).toContain('casual');
      expect(bias.outreach?.nudge).toBeDefined();
    });

    it('should compute match bias with category boosts and geo weight', async () => {
      const mockFeedback = [
        {
          type: 'MATCH',
          decision: 'UP',
          comment: 'Perfect outdoor fitness brand for my audience',
          targetId: 'brand_1',
          createdAt: new Date(),
        },
        {
          type: 'MATCH',
          decision: 'UP',
          comment: 'Love local fitness brands, great for community',
          targetId: 'brand_2',
          createdAt: new Date(),
        },
        {
          type: 'MATCH',
          decision: 'DOWN',
          comment: 'Avoid MLM companies, too pushy',
          targetId: 'brand_3',
          createdAt: new Date(),
        },
      ];

      const { prisma } = await import('@/prisma/client');
      vi.mocked(prisma.aiFeedback.findMany).mockResolvedValue(mockFeedback as any);

      const bias = await computeBias('workspace_123');

      expect(bias.match).toBeDefined();
      expect(bias.match?.boostCategories?.['outdoor']).toBeGreaterThan(1);
      expect(bias.match?.boostCategories?.['fitness']).toBeGreaterThan(1);
      expect(bias.match?.geoWeight).toBeGreaterThan(1);
      expect(bias.match?.downrankSignals).toContain('mlm');
    });

    it('should compute audit bias for presentation style', async () => {
      const mockFeedback = [
        {
          type: 'AUDIT',
          decision: 'UP',
          comment: 'Love the bullet points, easy to scan',
          targetId: 'audit_1',
          createdAt: new Date(),
        },
        {
          type: 'AUDIT',
          decision: 'DOWN',
          comment: 'Too much jargon, needs simpler language',
          targetId: 'audit_2',
          createdAt: new Date(),
        },
      ];

      const { prisma } = await import('@/prisma/client');
      vi.mocked(prisma.aiFeedback.findMany).mockResolvedValue(mockFeedback as any);

      const bias = await computeBias('workspace_123');

      expect(bias.audit).toBeDefined();
      expect(bias.audit?.style).toBe('bullet');
      expect(bias.audit?.avoid).toContain('jargon');
    });
  });

  describe('Hard Tone Override', () => {
    it('should return professional tone for high downvote rates', () => {
      const bias = {
        outreach: {
          toneBias: 'relaxed',
          do: ['friendly'],
          dont: ['formal'],
        },
      };

      const result = hardToneOverride(bias as any, 0.7);
      expect(result).toBe('professional');
    });

    it('should return undefined for acceptable downvote rates', () => {
      const bias = {
        outreach: {
          toneBias: 'relaxed',
          do: ['friendly'],
          dont: ['formal'],
        },
      };

      const result = hardToneOverride(bias as any, 0.3);
      expect(result).toBeUndefined();
    });
  });

  describe('Match Re-ranking', () => {
    const mockCandidates = [
      {
        id: '1',
        name: 'Local Fitness Brand',
        description: 'Community-focused fitness brand',
        tags: ['fitness', 'local'],
        matchScore: 85,
        distanceKm: 10,
      },
      {
        id: '2',
        name: 'National Sports Chain',
        description: 'Large sports retailer with MLM products',
        tags: ['sports', 'national'],
        matchScore: 90,
        distanceKm: 100,
      },
      {
        id: '3',
        name: 'Outdoor Adventure Co',
        description: 'Premium outdoor gear and equipment',
        tags: ['outdoor', 'premium'],
        matchScore: 80,
        distanceKm: 50,
      },
    ];

    it('should re-rank based on geo weight', () => {
      const bias = {
        match: {
          geoWeight: 1.5,
        },
      };

      const result = reRank(mockCandidates, bias as any);
      
      // Local brand should move up due to geo boost
      expect(result[0].id).toBe('1'); // Local Fitness Brand
      expect(result[0].distanceKm).toBe(10);
    });

    it('should re-rank based on category boosts', () => {
      const bias = {
        match: {
          boostCategories: {
            outdoor: 1.3,
            fitness: 1.2,
          },
        },
      };

      const result = reRank(mockCandidates, bias as any);
      
      // Outdoor brand should get boost
      expect(result[0].tags).toContain('outdoor');
    });

    it('should downrank based on negative signals', () => {
      const bias = {
        match: {
          downrankSignals: ['mlm'],
        },
      };

      const result = reRank(mockCandidates, bias as any);
      
      // MLM brand should be downranked
      const mlmBrand = result.find(c => c.description?.includes('MLM'));
      expect(mlmBrand).toBeDefined();
      expect(result.indexOf(mlmBrand!)).toBeGreaterThan(0);
    });

    it('should provide re-ranking explanations', () => {
      const bias = {
        match: {
          geoWeight: 1.5,
          boostCategories: {
            outdoor: 1.3,
          },
          downrankSignals: ['mlm'],
        },
      };

      const localBrand = mockCandidates[0];
      const explanations = getReRankExplanation(localBrand, bias as any);

      expect(explanations.some(e => e.includes('Geo boost'))).toBe(true);
      expect(explanations.some(e => e.includes('Category boost'))).toBe(true);
    });
  });

  describe('Feature Flag Control', () => {
    it('should respect feature flag for adaptation', () => {
      const { isOn } = await import('@/config/flags');
      vi.mocked(isOn).mockReturnValue(false);

      expect(isOn('ai.adapt.feedback')).toBe(false);
    });
  });
});
