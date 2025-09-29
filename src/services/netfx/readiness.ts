import { prisma } from '@/lib/prisma';

export async function computeReadinessBySegment() {
  // Placeholder logic: you can wire real scrapers later
  const segments = [
    { industry: 'beauty', sizeBand: '51-200', region: 'EU', jobs30d: 8, press90d: 3, adsActive: true },
    { industry: 'fitness', sizeBand: '11-50', region: 'NA', jobs30d: 2, press90d: 1, adsActive: false },
  ];
  for (const s of segments) {
    // simple scoring heuristic
    const score = Math.min(100, (s.jobs30d*5) + (s.press90d*10) + (s.adsActive?20:0) + 50);
    await prisma().brandReadinessSignal.create({
      data: {
        industry: s.industry,
        sizeBand: s.sizeBand,
        region: s.region,
        score,
        components: { jobs30d: s.jobs30d, press90d: s.press90d, adsActive: s.adsActive },
        source: 'public.v1'
      }
    });
  }
}
