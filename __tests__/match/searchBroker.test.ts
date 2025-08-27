import { describe, it, expect } from 'vitest';
import { searchKnown } from '@/services/brands/searchBroker';

describe('searchKnown', () => {
  it('returns seed candidates for keywords', async () => {
    const out = await searchKnown({ workspaceId: 'w', keywords: ['Acme'], includeLocal: false });
    expect(out.length).toBeGreaterThan(0);
    expect(out[0].name).toContain('Acme');
  });
});
