import { BrandRun, RunStep, PrerequisiteCheck } from './brandRun';
import { prisma } from '@/lib/prisma';

export interface StepResult {
  auditId?: string;
  selectedBrandIds?: string[];
  mediaPackId?: string;
  contactIds?: string[];
  sequenceId?: string;
}

export async function upsertRunForWorkspace(opts: {
  workspaceId: string;
  auto?: boolean;
}): Promise<BrandRun> {
  const { workspaceId, auto = false } = opts;

  // Try to find existing run for this workspace
  let run = await prisma.brandRun.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' }
  });

  if (!run) {
    // Create new run if none exists
    run = await prisma.brandRun.create({
      data: {
        workspaceId,
        auto,
        step: 'CONNECT',
        selectedBrandIds: [],
      }
    });
  }

  return run;
}

export async function recordStepResult(runId: string, payload: StepResult): Promise<void> {
  const updateData: Partial<Pick<BrandRun, 'auditId' | 'selectedBrandIds' | 'mediaPackId' | 'contactIds' | 'sequenceId'>> = {};

  if (payload.auditId) updateData.auditId = payload.auditId;
  if (payload.selectedBrandIds) updateData.selectedBrandIds = payload.selectedBrandIds;
  if (payload.mediaPackId) updateData.mediaPackId = payload.mediaPackId;
  if (payload.contactIds) updateData.contactIds = payload.contactIds;
  if (payload.sequenceId) updateData.sequenceId = payload.sequenceId;

  await prisma.brandRun.update({
    where: { id: runId },
    data: updateData
  });
}

export async function advanceTo(
  nextStep: RunStep, 
  runId?: string, 
  opts?: { workspaceId?: string }
): Promise<BrandRun> {
  if (!runId && !opts?.workspaceId) {
    throw new Error('Either runId or workspaceId must be provided');
  }

  let run: BrandRun;

  if (runId) {
    run = await prisma.brandRun.findUniqueOrThrow({ where: { id: runId } });
  } else {
    run = await upsertRunForWorkspace({ workspaceId: opts!.workspaceId! });
  }

  // Validate prerequisites before advancing
  const prereqCheck = await checkPrerequisitesForStep(nextStep, run);
  if (!prereqCheck.met) {
    throw new Error(`Cannot advance to ${nextStep}: ${prereqCheck.missing.join(', ')}`);
  }

  // Advance to next step
  const updatedRun = await prisma.brandRun.update({
    where: { id: run.id },
    data: { step: nextStep }
  });

  return updatedRun;
}

export async function checkPrerequisitesForStep(step: RunStep, run: BrandRun): Promise<PrerequisiteCheck> {
  const missing: string[] = [];
  const quickActions: Array<{ label: string; action: string; href?: string }> = [];

  switch (step) {
    case 'AUDIT':
      // No prerequisites for audit
      break;

    case 'MATCHES':
      // Requires audit to be completed
      if (!run.auditId) {
        missing.push('AI Audit completed');
        quickActions.push({
          label: 'Run Audit Now',
          action: 'audit',
          href: '/tools/audit'
        });
      }
      break;

    case 'APPROVE':
      // Requires brands to be selected
      if (!run.selectedBrandIds || run.selectedBrandIds.length === 0) {
        missing.push('Brands selected');
        quickActions.push({
          label: 'Select Brands Now',
          action: 'matches',
          href: '/tools/matches'
        });
      }
      break;

    case 'PACK':
      // Requires brands to be approved
      if (!run.selectedBrandIds || run.selectedBrandIds.length === 0) {
        missing.push('Brands approved');
        quickActions.push({
          label: 'Approve Brands Now',
          action: 'approve',
          href: '/tools/approve'
        });
      }
      break;

    case 'CONTACTS':
      // Requires media pack to be generated
      if (!run.mediaPackId) {
        missing.push('Media pack generated');
        quickActions.push({
          label: 'Generate Media Pack Now',
          action: 'pack',
          href: '/tools/pack'
        });
      }
      break;

    case 'OUTREACH':
      // Requires contacts to be discovered
      if (!run.contactIds || run.contactIds.length === 0) {
        missing.push('Contacts discovered');
        quickActions.push({
          label: 'Discover Contacts Now',
          action: 'contacts',
          href: '/tools/contacts'
        });
      }
      break;
  }

  return {
    met: missing.length === 0,
    missing,
    quickActions
  };
}

export async function getCurrentRunForWorkspace(workspaceId: string): Promise<BrandRun | null> {
  return await prisma.brandRun.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' }
  });
}
