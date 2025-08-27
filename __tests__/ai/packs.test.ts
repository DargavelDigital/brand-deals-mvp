import { describe, it, expect } from 'vitest';
import { loadPack } from '../../src/ai/promptPacks';

describe('Prompt packs', () => {
  it('audit pack has schema + system', () => {
    const p = loadPack('audit.insights');
    expect(p.systemPrompt).toBeTruthy();
    expect(p.inputSchema?.type).toBe('object');
    expect(p.outputSchema?.type).toBe('object');
    expect(p.outputSchema.required).toContain('headline');
  });

  it('match pack ready', () => {
    const p = loadPack('match.brandSearch');
    expect(p.outputSchema.required).toContain('matches');
  });

  it('outreach pack ready', () => {
    const p = loadPack('outreach.email');
    expect(p.outputSchema.required).toContain('subject');
    expect(p.outputSchema.required).toContain('body');
  });

  it('all packs have versioning', () => {
    const audit = loadPack('audit.insights');
    const match = loadPack('match.brandSearch');
    const outreach = loadPack('outreach.email');
    
    expect(audit.version).toBe('v1');
    expect(match.version).toBe('v1');
    expect(outreach.version).toBe('v1');
  });

  it('all packs have style knobs', () => {
    const audit = loadPack('audit.insights');
    const match = loadPack('match.brandSearch');
    const outreach = loadPack('outreach.email');
    
    expect(audit.styleKnobs?.tone).toBe(true);
    expect(match.styleKnobs?.tone).toBe(true);
    expect(outreach.styleKnobs?.tone).toBe(true);
  });
});
