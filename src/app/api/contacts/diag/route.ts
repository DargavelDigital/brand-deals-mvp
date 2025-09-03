import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  const wsid =
    (session as any)?.user?.workspaceId ??
    (session as any)?.workspaceId ??
    null

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
      hasSession: !!session,
      userId: (session as any)?.user?.id ?? null,
      workspaceId: wsid,
      isDemo: (session as any)?.user?.isDemo ?? null,
      role: (session as any)?.user?.role ?? null,
    },
    db: {
      hasPrisma: !!prisma,
      prismaPing,
      totalContacts,
    },
  })
}
