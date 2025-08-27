import { describe, it, expect, vi } from 'vitest';
import { aiRankCandidates } from '@/services/brands/aiRanker';

vi.mock('@/ai/invoke', () => ({
  aiInvoke: vi.fn(async () => ({
    results: [{
      id:'seed:0-Acme', name:'Acme Co.', source:'seed',
      categories:['niche'], score: 91,
      rationale:'Demographic match', pitchIdea:'Creator collab', factors:['age','geo']
    }]
  }))
}));

describe('aiRankCandidates', () => {
  it('returns ranked results', async () => {
    const res = await aiRankCandidates({ demo:true }, [
      { id:'seed:0-Acme', source:'seed', name:'Acme Co.', categories:['niche'] }
    ], 10);
    expect(res[0].score).toBeGreaterThan(0);
    expect(res[0].rationale).toBeTruthy();
  });
});
