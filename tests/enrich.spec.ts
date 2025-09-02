import { describe, it, expect } from 'vitest';
import { enrichContacts } from '@/services/contacts/enrich';

describe('enrichContacts', () => {
  it('returns mock when no providers', async () => {
    const items = await enrichContacts([{ name: 'Alex Chen', domain: 'brand.com', company: 'Brand' }]);
    expect(items[0].source).toBe('MOCK');
    expect(items[0].email).toBeTruthy();
  });
});
