import { prisma } from '@/lib/prisma';
import { aiInvoke } from '@/ai/aiInvoke';
import { isOn } from '@/config/flags';

export async function buildPlaybooks() {
  if (!isOn('netfx.playbooks.enabled')) return;

  // Example: build for each (industry, sizeBand, region, season)
  const segments = await prisma().$queryRaw<Array<{industry:string|null, sizeBand:string|null, region:string|null, season:string|null}>>`
    SELECT DISTINCT industry, sizeBand, region, season FROM "SignalAggregate"
  `;

  for (const s of segments) {
    const aggs = await prisma().signalAggregate.findMany({
      where: { industry: s.industry, sizeBand: s.sizeBand, region: s.region, season: s.season },
      orderBy: { computedAt: 'desc' },
      take: 200
    });

    if (aggs.length === 0) continue;

    const res = await aiInvoke('playbook.synth.v1', { aggregates: aggs });
    await prisma().playbook.create({
      data: {
        industry: s.industry,
        sizeBand: s.sizeBand,
        region: s.region,
        season: s.season,
        payload: res,
        rationale: res.rationale?.slice(0, 1000) ?? null,
        derivedFromAggAt: aggs[0].computedAt
      }
    });
  }
}
