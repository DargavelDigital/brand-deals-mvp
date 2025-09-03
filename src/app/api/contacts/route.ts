import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'

// Optional: only if you have Prisma wired here. If your prisma helper is elsewhere, import from there.
import { prisma } from '@/lib/prisma' // adjust the import path if needed

// Helper: allow demo sessions if you use demo auth in staging
const DEMO_OK = process.env.ENABLE_DEMO_AUTH === '1' || process.env.DEV_DEMO_AUTH === '1'

export async function GET(req: NextRequest) {
  try {
    // 1) Auth (NextAuth)
    const session = await getServerSession(authOptions)
    const isDemo = (session as any)?.user?.isDemo === true

    if (!session && !DEMO_OK) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
    }

    // 2) Pagination
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? '20')))
    const skip = (page - 1) * pageSize
    const take = pageSize

    // 3) Workspace scoping (if present on session)
    const wsid =
      (session as any)?.user?.workspaceId ??
      (session as any)?.workspaceId ??
      null

    // 4) If Prisma or DB not ready, gracefully return empty (never 404)
    if (!prisma || !wsid) {
      // For demo users with no DB, return empty list as a 200
      return NextResponse.json({ items: [], total: 0, page, pageSize }, { status: 200 })
    }

    // 5) Query contacts
    const [items, total] = await Promise.all([
      prisma.contact.findMany({
        where: { workspaceId: wsid },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          title: true,
          verifiedStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.contact.count({ where: { workspaceId: wsid } }),
    ])

    return NextResponse.json({ items, total, page, pageSize }, { status: 200 })
  } catch (err) {
    console.error('contacts:list error', err)
    // Return a 200 with empty data so the UI can render without breaking
    return NextResponse.json(
      { items: [], total: 0, page: 1, pageSize: 20, ok: false, error: 'CONTACTS_LIST_FAILED' },
      { status: 200 }
    )
  }
}