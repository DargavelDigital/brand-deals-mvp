import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, maskPII } from '@/lib/admin/guards'

export async function GET(_: NextRequest, { params }: { params: { runId: string } }) {
  await requireAdmin()
  const steps = await prisma.runStepExecution.findMany({
    where: { runId: params.runId },
    orderBy: { startedAt: 'asc' }
  })
  return NextResponse.json({ ok: true, steps: steps.map(s => ({ ...s, inputJson: maskPII(s.inputJson), outputJson: maskPII(s.outputJson), errorJson: maskPII(s.errorJson) })) })
}
