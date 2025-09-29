import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, auditLog } from '@/lib/admin/guards'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(_: NextRequest, { params }: { params: { runId: string, stepExecId: string } }) {
  const admin = await requireAdmin()
  const orig = await prisma().runStepExecution.findUnique({ where: { id: params.stepExecId } })
  if (!orig) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 })

  const startedAt = new Date()
  let output: any, errorJson: any = null, status = 'OK'
  try {
    // Example: call the same step using saved inputs.
    output = await executeStep(orig.step, orig.inputJson) // implement executeStep mapping to your orchestrator
  } catch (e: any) {
    status = 'FAIL'
    errorJson = { message: e?.message, stack: e?.stack }
  }
  const replay = await prisma().runStepExecution.create({
    data: {
      runId: orig.runId,
      step: orig.step,
      status,
      inputJson: orig.inputJson,
      outputJson: output ?? null,
      errorJson,
      startedAt,
      finishedAt: new Date(),
      replayOfId: orig.id,
    },
  })

  // compute diff
  const diff = computeDiff(orig.outputJson ?? {}, output ?? {})
  await auditLog({ action: 'STEP_REPLAYED', workspaceId: (await prisma().brandRun.findUnique({ where: { id: orig.runId }, select: { workspaceId: true } }))?.workspaceId, adminId: admin.id, metadata: { origId: orig.id, replayId: replay.id, diff } })
  return NextResponse.json({ ok: true, replayId: replay.id, diff })
}

// Simple diff computation
function computeDiff(original: any, current: any): any {
  if (typeof original !== typeof current) return { typeChanged: true }
  if (typeof original !== 'object' || original === null) {
    return original === current ? null : { from: original, to: current }
  }
  if (Array.isArray(original) !== Array.isArray(current)) return { arrayTypeChanged: true }
  
  const diff: any = {}
  const allKeys = new Set([...Object.keys(original), ...Object.keys(current)])
  
  for (const key of allKeys) {
    if (!(key in original)) {
      diff[key] = { added: current[key] }
    } else if (!(key in current)) {
      diff[key] = { removed: original[key] }
    } else {
      const keyDiff = computeDiff(original[key], current[key])
      if (keyDiff !== null) {
        diff[key] = keyDiff
      }
    }
  }
  
  return Object.keys(diff).length === 0 ? null : diff
}

// Simple dispatcher stub; wire to your real step fns.
async function executeStep(step: string, input: any) {
  switch (step) {
    case 'AUDIT': return { message: 'Audit step replayed', input }
    case 'MATCHES': return { message: 'Matches step replayed', input }
    case 'PACK': return { message: 'Media pack step replayed', input }
    case 'CONTACTS': return { message: 'Contacts step replayed', input }
    case 'OUTREACH': return { message: 'Outreach step replayed', input }
    default: throw new Error(`Unknown step ${step}`)
  }
}
