import { prisma } from '@/prisma/client';

// Simple in-memory cache for bias computation
const biasCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60_000; // 1 minute

export type Bias = {
  outreach?: {
    toneBias?: 'professional' | 'relaxed' | 'fun';
    do?: string[];
    dont?: string[];
    nudge?: string; // short global nudge
  };
  match?: {
    boostCategories?: Record<string, number>; // e.g. {"Outdoor": 1.2}
    downrankSignals?: string[]; // phrases to avoid (e.g., MLM, dropshipping)
    geoWeight?: number; // 0..2
  };
  audit?: {
    style?: 'bullet' | 'narrative' | 'executive';
    avoid?: string[];
  };
};

type Window = { days?: number; limit?: number };

export async function computeBias(
  workspaceId: string,
  win: Window = { days: 14, limit: 500 }
): Promise<Bias> {
  const cacheKey = `bias:${workspaceId}:${win.days}:${win.limit}`;
  const cached = biasCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const since = new Date(Date.now() - (win.days ?? 14) * 24 * 3600 * 1000);
  const rows = await prisma.aiFeedback.findMany({
    where: { workspaceId, createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
    take: win.limit ?? 500,
    select: {
      type: true,
      decision: true,
      comment: true,
      targetId: true,
      createdAt: true,
    },
  });

  const bias: Bias = {};

  // Outreach: infer preferred tone + do/don't phrases
  {
    const o = rows.filter((r) => r.type === 'OUTREACH');
    const ups = o.filter((r) => r.decision === 'UP');
    const downs = o.filter((r) => r.decision === 'DOWN');

    // naive tone inference from comments
    const toneVotes = { professional: 0, relaxed: 0, fun: 0 };
    for (const r of o) {
      const c = (r.comment ?? '').toLowerCase();
      if (c.includes('too casual') || c.includes('more formal')) toneVotes.professional++;
      if (c.includes('stiff') || c.includes('formal')) toneVotes.relaxed++;
      if (c.includes('boring') || c.includes('lively')) toneVotes.fun++;
    }
    const toneBias = (Object.entries(toneVotes).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      undefined) as Bias['outreach']['toneBias'];

    const topPhrases = (arr: string[], pick = 5) => {
      const bag: Record<string, number> = {};
      for (const s of arr) {
        s.split(/\W+/).forEach((w) => {
          const k = w.trim().toLowerCase();
          if (k.length < 4) return;
          bag[k] = (bag[k] || 0) + 1;
        });
      }
      return Object.entries(bag)
        .sort((a, b) => b[1] - a[1])
        .slice(0, pick)
        .map(([k]) => k);
    };

    const doPhrases = topPhrases(ups.map((r) => r.comment ?? ''), 5);
    const dontPhrases = topPhrases(downs.map((r) => r.comment ?? ''), 5);

    if (o.length) {
      bias.outreach = {
        toneBias,
        do: doPhrases,
        dont: dontPhrases,
        nudge: downs.length / Math.max(1, o.length) > 0.4 ? 'Reduce fluff; tighten CTA.' : undefined,
      };
    }
  }

  // Matches: infer category boosts + geo weight
  {
    const m = rows.filter((r) => r.type === 'MATCH');
    if (m.length) {
      // Heuristic: comments with "local", "near", "distance" => increase geo
      const geoMentions = m.filter((r) =>
        (r.comment ?? '').toLowerCase().match(/\blocal|nearby|distance|city|town\b/)
      );
      const geoWeight = Math.min(2, 1 + geoMentions.length / Math.max(5, m.length)); // 1..2

      // Pull category hints from positive comments (e.g., "outdoor", "fitness")
      const ups = m.filter((r) => r.decision === 'UP');
      const catWords = [
        'outdoor',
        'fitness',
        'beauty',
        'finance',
        'gaming',
        'travel',
        'fashion',
        'food',
        'home',
        'education',
        'tech',
      ];
      const boost: Record<string, number> = {};
      for (const u of ups) {
        const c = (u.comment ?? '').toLowerCase();
        for (const w of catWords) if (c.includes(w)) boost[w] = (boost[w] ?? 1) + 0.1;
      }

      // Downrank signals
      const downs = m.filter((r) => r.decision === 'DOWN');
      const downSignals = ['mlm', 'dropship', 'spam', 'misaligned', 'adult', 'gambling'];
      const hits = new Set<string>();
      for (const d of downs) {
        const c = (d.comment ?? '').toLowerCase();
        for (const s of downSignals) if (c.includes(s)) hits.add(s);
      }

      bias.match = {
        boostCategories: Object.keys(boost).length ? boost : undefined,
        downrankSignals: hits.size ? [...hits] : undefined,
        geoWeight,
      };
    }
  }

  // Audit: style tweaks
  {
    const a = rows.filter((r) => r.type === 'AUDIT');
    if (a.length) {
      const txt = a.map((r) => r.comment ?? '').join(' ').toLowerCase();
      let style: 'bullet' | 'narrative' | 'executive' | undefined;
      if (txt.includes('bullets') || txt.includes('bullet')) style = 'bullet';
      if (txt.includes('story') || txt.includes('narrative')) style = 'narrative';
      if (txt.includes('exec') || txt.includes('summary')) style = 'executive';

      const avoid: string[] = [];
      if (txt.includes('jargon')) avoid.push('jargon');
      if (txt.includes('generic')) avoid.push('generic wording');

      bias.audit = { style, avoid: avoid.length ? avoid : undefined };
    }
  }

  // Cache the result
  biasCache.set(cacheKey, { data: bias, timestamp: Date.now() });
  return bias;
}

// Helper for hard tone override when feedback is very negative
export function hardToneOverride(bias: Bias, windowDownRate: number): 'professional' | undefined {
  return windowDownRate > 0.6 ? 'professional' : undefined;
}

// Get recent downvote rate for a specific feedback type
export async function getRecentDownRate(
  workspaceId: string,
  type: 'OUTREACH' | 'MATCH' | 'AUDIT',
  hours: number = 24
): Promise<number> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recent = await prisma.aiFeedback.findMany({
    where: { workspaceId, type, createdAt: { gte: since } },
    select: { decision: true },
  });

  if (recent.length === 0) return 0;
  const downs = recent.filter((r) => r.decision === 'DOWN').length;
  return downs / recent.length;
}
