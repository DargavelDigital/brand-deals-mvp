import type { BrandCandidate, BrandSearchInput } from '@/types/match';
import { isFlagOn } from '@/lib/flags';

const HAS_GOOGLE = !!process.env.GOOGLE_PLACES_API_KEY;
const HAS_YELP = !!process.env.YELP_API_KEY;

type GooglePlace = any; // narrowed inside functions
type YelpBiz = any;

function normalizeDomain(url?: string) {
  try {
    if (!url) return undefined;
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./,'').toLowerCase();
  } catch { return undefined; }
}

function kmFromMeters(m: number|undefined) { return m ? Math.round(m/10)/100 : undefined; }

export async function searchLocal(
  input: BrandSearchInput
): Promise<BrandCandidate[]> {
  if (!isFlagOn('match.local.enabled')) return [];

  const { geo, radiusKm = 20, categories = [] } = input;
  if (!geo) return [];

  const out: BrandCandidate[] = [];

  // Adapter: Google Places (Text Search nearby by categories)
  if (HAS_GOOGLE) {
    for (const cat of categories.length ? categories : ['marketing','cafe','gym','salon','retail']) {
      const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
      url.searchParams.set('key', process.env.GOOGLE_PLACES_API_KEY!);
      url.searchParams.set('location', `${geo.lat},${geo.lng}`);
      url.searchParams.set('radius', String(Math.min(50000, Math.round(radiusKm*1000))));
      url.searchParams.set('keyword', cat);

      try {
        const res = await fetch(url.toString());
        const json = await res.json();
        const results: GooglePlace[] = json.results ?? [];
        for (const p of results) {
          const website = p.website || p.vicinity;
          out.push({
            id: `google:${p.place_id}`,
            source: 'google',
            name: p.name,
            domain: normalizeDomain(website),
            categories: [cat],
            geo: {
              location: { lat: p.geometry?.location?.lat, lng: p.geometry?.location?.lng },
              distanceKm: undefined,
              city: undefined, country: undefined
            },
            rating: p.rating,
            reviewCount: p.user_ratings_total,
            hoursOpenNow: p.opening_hours?.open_now ?? false,
            socials: { website },
          });
        }
      } catch {}
    }
  }

  // Adapter: Yelp (category + geo)
  if (HAS_YELP) {
    const cats = categories.length ? categories : ['coffee','gyms','cosmetics','fashion','marketing'];
    for (const cat of cats) {
      try {
        const url = new URL('https://api.yelp.com/v3/businesses/search');
        url.searchParams.set('latitude', String(geo.lat));
        url.searchParams.set('longitude', String(geo.lng));
        url.searchParams.set('radius', String(Math.min(40000, Math.round(radiusKm*1000))));
        url.searchParams.set('categories', cat);
        url.searchParams.set('limit', '20');

        const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${process.env.YELP_API_KEY!}` } });
        const json = await res.json();
        const results: YelpBiz[] = json.businesses ?? [];
        for (const b of results) {
          const website = b.url;
          const distanceKm = kmFromMeters(b.distance);
          out.push({
            id: `yelp:${b.id}`,
            source: 'yelp',
            name: b.name,
            domain: normalizeDomain(website),
            categories: [cat],
            geo: {
              location: { lat: b.coordinates?.latitude, lng: b.coordinates?.longitude },
              distanceKm,
              city: b.location?.city, country: b.location?.country
            },
            rating: b.rating,
            reviewCount: b.review_count,
            socials: { website },
          });
        }
      } catch {}
    }
  }

  // Fallback mock if no keys present
  if (!HAS_GOOGLE && !HAS_YELP) {
    const mock: BrandCandidate[] = [
      {
        id: 'mock:local1',
        source: 'mock',
        name: 'Bean Orbit Coffee',
        domain: 'beanorbit.local',
        categories: ['cafe'],
        geo: { location: { ...geo }, distanceKm: 1.2, city: 'Nearby', country: '—' },
        rating: 4.6, reviewCount: 312,
        socials: { website: 'https://beanorbit.example' },
      },
      {
        id: 'mock:local2',
        source: 'mock',
        name: 'PulseFit Gym',
        domain: 'pulsefit.local',
        categories: ['gym'],
        geo: { location: { ...geo }, distanceKm: 2.8, city: 'Nearby', country: '—' },
        rating: 4.8, reviewCount: 201,
        socials: { website: 'https://pulsefit.example' },
      },
    ];
    out.push(...mock);
  }

  return dedupe(out);
}

// Phase A "Known" (keywords, directories/seed). Simple placeholder to keep interface.
export async function searchKnown(input: BrandSearchInput): Promise<BrandCandidate[]> {
  const { keywords = [] } = input;
  if (!keywords.length) return [];
  // For now, return mock "known" brands. Phase B/C can expand via SERP or your internal DB.
  return keywords.slice(0, 5).map((k, i) => ({
    id: `seed:${i}-${k}`,
    source: 'seed',
    name: `${k} Co.`,
    domain: `${k.replace(/\s+/g,'').toLowerCase()}.com`,
    categories: ['niche'],
    socials: { website: `https://www.google.com/search?q=${encodeURIComponent(k)}` },
  }));
}

// Phase B enrichment hook (stub)
export async function enrichDomains(domains: string[]): Promise<Record<string, Partial<BrandCandidate>>> {
  // TODO integrate Clearbit/Crunchbase
  return {};
}

function dedupe(list: BrandCandidate[]): BrandCandidate[] {
  const map = new Map<string, BrandCandidate>();
  for (const c of list) {
    const key = c.domain || `${c.source}:${c.id}`; // favor domain if available
    if (!map.has(key)) map.set(key, c);
  }
  return Array.from(map.values());
}
