import { getBrandLogo } from '@/lib/brandLogo';

describe('getBrandLogo', () => {
  it('returns clearbit url for normal domains', () => {
    expect(getBrandLogo('nike.com', 40)).toBe('https://logo.clearbit.com/nike.com');
  });
  it('strips protocols and paths', () => {
    expect(getBrandLogo('https://www.nike.com/us', 32)).toBe('https://logo.clearbit.com/www.nike.com');
  });
  it('falls back to placeholder when empty', () => {
    expect(getBrandLogo('', 24)).toBe('/api/placeholder/24/24');
    expect(getBrandLogo(undefined, 24)).toBe('/api/placeholder/24/24');
  });
});
