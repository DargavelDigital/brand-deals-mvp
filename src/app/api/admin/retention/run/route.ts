import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  // For each workspace, compute cutoffs and delete old rows safely.
  const workspaces = await prisma.workspace.findMany({ select: { id: true }});
  for (const ws of workspaces) {
    const p = await prisma.retentionPolicy.findUnique({ where: { workspaceId: ws.id }});
    const defDays = env.DATA_RETENTION_DEFAULT_DAYS;

    async function purge(model: any, days?: number) {
      const cutoff = addDays(new Date(), -1 * (days ?? defDays));
      // Purge by createdAt; add constraints per model present in your DB
      await model.deleteMany({ where: { workspaceId: ws.id, createdAt: { lt: cutoff } }});
    }

    await purge(prisma.adminActionLog, p?.logsDays ?? undefined).catch(()=>{});
    await purge(prisma.contentSafetyCheck, p?.logsDays ?? undefined).catch(()=>{});
    await purge(prisma.audit, p?.auditsDays ?? undefined).catch(()=>{});
    await purge(prisma.sequenceStep, p?.outreachDays ?? undefined).catch(()=>{});
    await purge(prisma.mediaPack, p?.mediaPacksDays ?? undefined).catch(()=>{});
    // contacts usually not auto-deleted; skip unless policy set
    if (p?.contactsDays) await purge(prisma.contact, p.contactsDays).catch(()=>{});
  }
  return NextResponse.json({ ok: true });
}
