import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  await prisma.workspace.updateMany({ data: { emailDailyUsed: 0 } })
  return NextResponse.json({ ok: true })
}
