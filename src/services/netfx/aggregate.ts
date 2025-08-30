import { prisma } from '@/lib/prisma';
import { getFlag, isOn } from '@/config/flags';

function laplaceNoise(scale: number) {
  // Simple Laplace via inverse CDF
  const u = Math.random() - 0.5;
  return -scale * Math.sign(u) * Math.log(1 - 2*Math.abs(u));
}

export async function runAggregation() {
  if (!isOn('netfx.enabled')) return;

  const kmin = getFlag('netfx.kmin') as number;
  const epsilon = getFlag('netfx.dp.epsilon') as number;
  const dpScale = 1 / epsilon;

  // Group by coarse segment fields
  const rows = await prisma.$queryRaw<Array<{
    industry: string|null,
    sizeBand: string|null,
    region: string|null,
    season: string|null,
    tone: string|null,
    templateFamily: string|null,
    sendDow: number|null,
    sendHour: number|null,
    sends: bigint,
    replies: bigint,
    wins: bigint,
    revenueUsd: number|null
  }>>`
    SELECT
      industry, sizeBand, region, season, tone, templateFamily, sendDow, sendHour,
      COUNT(*) as sends,
      SUM(CASE WHEN replied THEN 1 ELSE 0 END) as replies,
      SUM(CASE WHEN won THEN 1 ELSE 0 END) as wins,
      COALESCE(SUM(valueUsd),0) as revenueUsd
    FROM "SignalEvent"
    GROUP BY industry, sizeBand, region, season, tone, templateFamily, sendDow, sendHour
  `;

  // Save aggregates with DP noise and k-min
  for (const r of rows) {
    const sends = Number(r.sends);
    if (sends < kmin) continue;

    // add DP noise to event counts (bounded sensitivity 1)
    const repliesNoisy = Math.max(0, Number(r.replies) + laplaceNoise(dpScale));
    const winsNoisy = Math.max(0, Number(r.wins) + laplaceNoise(dpScale));

    await prisma.signalAggregate.create({
      data: {
        industry: r.industry,
        sizeBand: r.sizeBand,
        region: r.region,
        season: r.season,
        tone: r.tone,
        templateFamily: r.templateFamily,
        sendDow: r.sendDow ?? null,
        sendHour: r.sendHour ?? null,
        sends,
        replies: Math.round(repliesNoisy),
        wins: Math.round(winsNoisy),
        revenueUsd: r.revenueUsd ?? 0,
        dpEpsilon: epsilon,
        kmin: kmin,
      }
    });
  }
}
