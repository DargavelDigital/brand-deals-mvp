import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export async function GET(_: NextRequest, { params }: any) {
  const id = params.id as string
  const steps = await prisma().sequenceStep.findMany({
    where: { sequenceId: id },
    select: { status:true, openedAt:true, clickedAt:true, repliedAt:true, bouncedAt:true }
  })
  const total = steps.length
  const sent = steps.filter(s=>s.status==='SENT').length
  const opened = steps.filter(s=>s.openedAt).length
  const clicked = steps.filter(s=>s.clickedAt).length
  const replied = steps.filter(s=>s.repliedAt).length
  const bounced = steps.filter(s=>s.bouncedAt).length
  return NextResponse.json({ total, sent, opened, clicked, replied, bounced })
}
