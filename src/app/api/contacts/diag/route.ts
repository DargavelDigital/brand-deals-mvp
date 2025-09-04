import { NextResponse } from 'next/server'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const workspaceId = await requireSessionOrDemo({} as any)
  const wsid = workspaceId

  const dbUrlSet = !!process.env.DATABASE_URL
  let prismaPing: boolean | null = null
  let totalContacts: number | null = null

  try {
    if (prisma && wsid) {
      await prisma.$queryRaw`SELECT 1`
      prismaPing = true
      totalContacts = await prisma.contact.count({ where: { workspaceId: wsid } })
    } else if (prisma && !wsid) {
      await prisma.$queryRaw`SELECT 1`
      prismaPing = true
      totalContacts = null
    }
  } catch {
    prismaPing = false
  }

  return NextResponse.json({
    ok: true,
    env: {
      DATABASE_URL_set: dbUrlSet,
      ENABLE_DEMO_AUTH: process.env.ENABLE_DEMO_AUTH ?? null,
      ALLOW_CONTACTS_MOCK: process.env.ALLOW_CONTACTS_MOCK ?? null,
    },
    session: {
      hasSession: !!workspaceId,
      userId: null, // requireSessionOrDemo doesn't return user details
      workspaceId: wsid,
      isDemo: workspaceId === 'demo-workspace',
      role: null, // requireSessionOrDemo doesn't return role details
    },
    db: {
      hasPrisma: !!prisma,
      prismaPing,
      totalContacts,
    },
  })
}
