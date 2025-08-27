import { prisma } from '@/lib/prisma';
import { flag } from '@/lib/flags';
import type { RunSummary, StepKey, StepRecord } from '@/types/brandrun';

// Reuse your services (mock/real behind providers):
import { getProviders } from '@/services/providers';
import { getLatestAuditOrRunAudit } from '@/services/audit/helpers';
import { aiRankCandidates } from '@/services/brands/aiRanker';
import { searchLocal, searchKnown } from '@/services/brands/searchBroker';

type Ctx = { runId: string; workspaceId: string };

function nowISO() { return new Date().toISOString(); }

async function loadRun(runId: string) {
  return prisma.brandRun.findUnique({ where: { id: runId } });
}

async function writeStatus(runId: string, updater: (prev: any) => any) {
  const run = await loadRun(runId);
  const prev = (run?.stepStatuses as any) ?? { steps: [], lastUpdated: null };
  const next = updater(prev);
  await prisma.brandRun.update({
    where: { id: runId },
    data: { stepStatuses: next, updatedAt: new Date() }
  });
}

async function setStep(runId: string, key: StepKey, status: 'running'|'ok'|'error', patch?: Partial<StepRecord>) {
  await writeStatus(runId, (prev: any) => {
    const steps: StepRecord[] = prev.steps || [];
    const idx = steps.findIndex(s => s.key === key);
    const base: StepRecord = idx >= 0 ? steps[idx] : { key, status: 'idle' };
    const merged: StepRecord = {
      ...base,
      ...patch,
      key,
      status,
      ...(status === 'running' && !base.startedAt ? { startedAt: nowISO() } : {}),
      ...(status !== 'running' ? { endedAt: nowISO() } : {}),
    };
    if (idx >= 0) steps[idx] = merged; else steps.push(merged);
    return { steps, lastUpdated: nowISO() };
  });
}

export async function brandRunOrchestrator(runId: string, workspaceId: string) {
  const providers = getProviders(); // ai, audit, brands, mediaPack, discovery, outreach, email, etc.
  const summary: RunSummary = {
    runId, workspaceId,
    steps: [],
    artifacts: {},
    completed: false,
  };

  // 1) Ensure connections or use cached metrics
  await setStep(runId, 'connections', 'running');
  try {
    // You likely have a connection status service already (reuse it).
    const connections = await providers.connections?.status?.(workspaceId).catch(()=>[]);
    await setStep(runId, 'connections', 'ok', { artifact: { connections } });
  } catch (e:any) {
    await setStep(runId, 'connections', 'error', { error: e?.message || 'connections failed' });
    throw e;
  }

  // 2) Run audit (or load latest within TTL)
  await setStep(runId, 'audit', 'running');
  try {
    const audit = await getLatestAuditOrRunAudit(workspaceId); // implement: returns { id, snapshot }
    summary.artifacts.auditId = audit.id;
    await setStep(runId, 'audit', 'ok', { artifact: { auditId: audit.id } });
  } catch (e:any) {
    await setStep(runId, 'audit', 'error', { error: e?.message || 'audit failed' });
    throw e;
  }

  // 3) Match brands (global + local)
  await setStep(runId, 'match', 'running');
  try {
    // get audit snapshot again
    const auditRow = await prisma.audit.findUnique({ where: { id: summary.artifacts.auditId! } });
    const snapshot = auditRow?.snapshotJson ?? {};
    // a) gather candidates
    const localEnabled = !!flag('match.local.enabled');
    const candidatesLocal = localEnabled ? await searchLocal({ workspaceId, includeLocal: true, radiusKm: 20 }) : [];
    const candidatesKnown = await searchKnown({ workspaceId, keywords: ['DTC', 'ecommerce', 'lifestyle', 'fitness'] }); // safe seed
    const candidates = [...candidatesLocal, ...candidatesKnown];

    // b) AI rank
    const ranked = await aiRankCandidates(snapshot, candidates, 48);
    summary.artifacts.matches = ranked.map(r => ({ id: r.id, name: r.name, score: r.score }));
    await setStep(runId, 'match', 'ok', { artifact: { count: ranked.length } });
  } catch (e:any) {
    await setStep(runId, 'match', 'error', { error: e?.message || 'match failed' });
    throw e;
  }

  // 4) Auto-select top N
  await setStep(runId, 'select', 'running');
  try {
    const N = Number(flag('brandrun.selectTopN')) || 6;
    const sorted = (summary.artifacts.matches || []).sort((a,b)=> (b.score||0)-(a.score||0));
    const selected = sorted.slice(0, N).map(b => b.id);
    summary.artifacts.selectedBrandIds = selected;
    await prisma.brandRun.update({ where: { id: runId }, data: { selectedBrandIds: selected } });
    await setStep(runId, 'select', 'ok', { artifact: { selectedCount: selected.length } });
  } catch (e:any) {
    await setStep(runId, 'select', 'error', { error: e?.message || 'select failed' });
    throw e;
  }

  // 5) Generate media pack (default template)
  await setStep(runId, 'mediapack', 'running');
  try {
    const template = flag('mediapack.v2') ? 'brand' : 'default';
    const mp = await providers.mediaPack.generate({
      workspaceId,
      template,
      customizations: {},
      brands: summary.artifacts.selectedBrandIds || [],
      creatorProfile: {}, // fetch from your creator profile store if available
    });
    summary.artifacts.mediaPack = { id: mp.id, htmlUrl: mp.htmlUrl, pdfUrl: mp.pdfUrl, variant: template };
    await setStep(runId, 'mediapack', 'ok', { artifact: summary.artifacts.mediaPack });
  } catch (e:any) {
    await setStep(runId, 'mediapack', 'error', { error: e?.message || 'media pack failed' });
    throw e;
  }

  // 6) Discover ≥1 contact per brand (mock/real)
  await setStep(runId, 'contacts', 'running');
  try {
    const out:any[] = [];
    for (const brandId of (summary.artifacts.selectedBrandIds || [])) {
      const c = await providers.discovery.run({
        brandId,
        min: 1,
        seniority: ['Manager','Director','Head','VP'],
        departments: ['Marketing','Partnerships','Brand']
      });
      if (c?.length) {
        // persist contacts if your API requires; collect ids
        out.push({ brandId, contactId: c[0].id, email: c[0].email });
      }
    }
    summary.artifacts.contacts = out;
    await setStep(runId, 'contacts', 'ok', { artifact: { count: out.length } });
  } catch (e:any) {
    await setStep(runId, 'contacts', 'error', { error: e?.message || 'contacts failed' });
    throw e;
  }

  // 7) Create outreach sequence (Professional, 3 steps)
  await setStep(runId, 'outreach', 'running');
  try {
    const seq = await providers.outreach.createSequence({
      workspaceId,
      name: 'One-Touch Sequence',
      tone: 'professional',               // EPIC 2 tone system
      paused: true,                       // 8) pause before first send
      mediaPackId: summary.artifacts.mediaPack?.id,
      contacts: summary.artifacts.contacts || [],
      steps: [
        { templateKey: 'intro_v1', delay: 0, delayUnit: 'days' },
        { templateKey: 'proof_v1', delay: 3, delayUnit: 'days' },
        { templateKey: 'nudge_v1', delay: 6, delayUnit: 'days' },
      ],
      settings: { replyDetection: true, autoFollowUp: true, pauseFirstSend: true },
    });
    summary.artifacts.outreach = { sequenceId: seq.id, status: 'PAUSED' };
    await setStep(runId, 'outreach', 'ok', { artifact: { sequenceId: seq.id } });
  } catch (e:any) {
    await setStep(runId, 'outreach', 'error', { error: e?.message || 'outreach failed' });
    throw e;
  }

  // 8) Complete
  await setStep(runId, 'complete', 'ok');
  summary.completed = true; summary.completedAt = nowISO();

  // Persist summary
  await prisma.brandRun.update({
    where: { id: runId },
    data: { runSummaryJson: summary, updatedAt: new Date() }
  });

  return summary;
}
