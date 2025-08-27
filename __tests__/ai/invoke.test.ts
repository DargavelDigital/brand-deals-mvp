import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiInvoke } from '../../src/ai/invoke';
import creator from '../../src/ai/fixtures/creator.json';
import audit from '../../src/ai/fixtures/audit.json';
import brands from '../../src/ai/fixtures/brands.json';

// Mock the OpenAI client
vi.mock('openai', () => ({
  default: class OpenAI {
    responses = {
      create: async (_: any) => ({
        output_text: JSON.stringify((globalThis as any).__OPENAI_MOCK__ ?? { ok: true })
      })
    }
  }
}));

beforeEach(() => {
  // default mock response for each pack; you can tailor per call if needed
  // audit
  (globalThis as any).__OPENAI_MOCK__ = {
    headline: 'Strong mid-funnel authority',
    keyFindings: ['A','B','C'],
    risks: [],
    moves: [{ title:'T1', why:'Because'}]
  };
});

describe('aiInvoke (mocked)', () => {
  it('audit.insights returns JSON with required keys', async () => {
    const res = await aiInvoke('audit.insights', { creator, audit }, { tone: 'professional', brevity: 'medium' }) as any;
    expect(res.headline).toBeTruthy();
    expect(Array.isArray(res.keyFindings)).toBe(true);
  });

  it('match.brandSearch returns schema', async () => {
    (globalThis as any).__OPENAI_MOCK__ = {
      matches: [
        { brandId: 'acme', score: 91, rationale: 'High audience overlap' }
      ],
      notes: 'OK'
    };
    const res = await aiInvoke('match.brandSearch', { creator, audit, brands }) as any;
    expect(Array.isArray(res.matches)).toBe(true);
  });

  it('outreach.email returns subject/body', async () => {
    (globalThis as any).__OPENAI_MOCK__ = {
      subject: 'Ideas for {{brand_name}} × {{creator_name}}',
      body: 'Hi {{creator_name}}, I hope this email finds you well...',
      toneUsed: 'professional',
      reasoning: 'Based on audit …'
    };
    const res = await aiInvoke('outreach.email', { creator, brand: brands[0], mediaPackUrl: 'https://x' }, { tone: 'relaxed' }) as any;
    expect(res.subject).toMatch(/{{brand_name}}/);
    expect(res.body).toContain('{{creator_name}}');
  });

  it('handles tone and brevity options', async () => {
    (globalThis as any).__OPENAI_MOCK__ = {
      headline: 'Test',
      keyFindings: ['A'],
      risks: [],
      moves: [{ title: 'Test', why: 'Test' }]
    };
    
    const res = await aiInvoke('audit.insights', { creator, audit }, { 
      tone: 'fun', 
      brevity: 'short' 
    }) as any;
    
    expect(res.headline).toBe('Test');
  });
});
