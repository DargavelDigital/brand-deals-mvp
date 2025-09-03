import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma' // adjust import if your path differs

const DEMO_OK =
  process.env.ENABLE_DEMO_AUTH === '1' ||
  process.env.DEV_DEMO_AUTH === '1'

const allowMock = process.env.ALLOW_CONTACTS_MOCK === '1'

function okJson(data: any, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === 'number' ? { status: init } : init)
}

/**
 * GET /api/contacts?page=1&pageSize=20
 * Lists contacts for current workspace.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isDemo = (session as any)?.user?.isDemo === true

    if (!session && !DEMO_OK) {
      return okJson({ ok: false, error: 'UNAUTHENTICATED' }, 401)
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? '20')))
    const skip = (page - 1) * pageSize
    const take = pageSize

    const wsid =
      (session as any)?.user?.workspaceId ??
      (session as any)?.workspaceId ??
      null

    if (!prisma || !wsid) {
      if (allowMock) {
        // old behavior for local demo only
        return okJson({ items: [], total: 0, page, pageSize }, 200)
      }
      return okJson({ ok: false, error: 'NO_DB_OR_WORKSPACE' }, 503)
    }

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

    return okJson({ items, total, page, pageSize }, 200)
  } catch (err) {
    console.error('contacts:list error', err)
    // Return 200 with empty list so the page doesn't crash
    return okJson({ items: [], total: 0, page: 1, pageSize: 20, ok: false, error: 'CONTACTS_LIST_FAILED' }, 200)
  }
}

/**
 * POST /api/contacts
 * Body: { name?, email?, company?, title?, linkedinUrl? }
 * Creates a contact in the current workspace.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session && !DEMO_OK) {
      return okJson({ ok: false, error: 'UNAUTHENTICATED' }, 401)
    }

    const wsid =
      (session as any)?.user?.workspaceId ??
      (session as any)?.workspaceId ??
      null

    const body = await req.json().catch(() => ({}))
    const {
      name = '',
      email = '',
      company = '',
      title = '',
    } = body ?? {}

    // If no DB (e.g., demo/staging without DB), just echo a fake created record
    if (!prisma || !wsid) {
      if (allowMock) {
        return okJson({
          ok: true,
          item: {
            id: 'demo_' + Math.random().toString(36).slice(2),
            name,
            email,
            company,
            title,
            verifiedStatus: 'UNVERIFIED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }, 200)
      }
      return okJson({ ok: false, error: 'NO_DB_OR_WORKSPACE' }, 503)
    }

    const item = await prisma.contact.create({
      data: {
        id: `contact_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        workspaceId: wsid,
        name,
        email,
        company,
        title,
        verifiedStatus: 'UNVERIFIED',
        updatedAt: new Date(),
      },
      select: {
        id: true, name: true, email: true, company: true, title: true,
        verifiedStatus: true,
        createdAt: true, updatedAt: true,
      },
    })

    return okJson({ ok: true, item }, 200)
  } catch (err) {
    console.error('contacts:create error', err)
    return okJson({ ok: false, error: 'CONTACTS_CREATE_FAILED' }, 200)
  }
}

/**
 * (Optional, for later) PUT/DELETE by id:
 * Add /api/contacts/[id]/route.ts for updates and deletes when needed.
 */