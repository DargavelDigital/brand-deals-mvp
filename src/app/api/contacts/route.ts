import { NextResponse } from 'next/server'
import { newTraceId, logServerError } from '@/lib/diag/trace'
import { pagingSchema } from '@/lib/http/paging'
import { requireAuth } from '@/lib/auth/requireAuth'
import { getPrisma } from '@/lib/db'
import { randomUUID } from 'crypto'
import { env } from '@/lib/env'

export async function GET(req: Request) {
  // Fail gracefully when DATABASE_URL is missing
  if (!env.DATABASE_URL) {
    return NextResponse.json({
      ok: false,
      error: "DATABASE_URL_MISSING",
      message: "Set DATABASE_URL to use contacts API"
    }, { status: 500 })
  }

  const traceId = newTraceId()
  const prisma = getPrisma()
  
  try {
    // Use requireAuth helper
    const auth = await requireAuth()
    const workspaceId = auth.workspace.id

    const url = new URL(req.url)
    const query = pagingSchema.safeParse({
      page: url.searchParams.get('page'),
      pageSize: url.searchParams.get('pageSize'),
      q: url.searchParams.get('q') || undefined,
    })
    if (!query.success) {
      return NextResponse.json({ ok:false, traceId, error:'BAD_REQUEST', issues: query.error.flatten() }, { status: 400 })
    }
    const { page, pageSize, q } = query.data

    // Parse additional filter parameters
    const status = url.searchParams.get('status') as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | undefined
    const verifiedStatus = url.searchParams.get('verifiedStatus') as 'UNVERIFIED' | 'VALID' | 'RISKY' | 'INVALID' | undefined
    const seniority = url.searchParams.get('seniority') || undefined
    const department = url.searchParams.get('department') || undefined
    const tags = url.searchParams.get('tags') || undefined

    // If Prisma is not available (no DATABASE_URL), fail-soft with empty data (not 500)
    if (!prisma) {
      return NextResponse.json({
        ok: true,
        items: [],
        total: 0,
        page,
        pageSize,
        workspaceId,
        note: 'DB unavailable — returning empty list',
      })
    }

    const where = {
      workspaceId,
      ...(q ? {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { company: { contains: q } },
        ]
      } : {}),
      ...(status ? { status } : {}),
      ...(verifiedStatus ? { verifiedStatus } : {}),
      ...(seniority ? { seniority } : {}),
      ...(department ? { department } : {}),
      ...(tags ? {
        tags: {
          hasSome: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        }
      } : {})
    }

    const [total, items] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, name: true, title: true, email: true, company: true,
          verifiedStatus: true, score: true, source: true, createdAt: true,
        }
      })
    ])

    return NextResponse.json({ ok: true, items, total, page, pageSize })
  } catch (err: any) {
    // If it's a NextResponse (our auth error), return it directly
    if (err instanceof NextResponse) {
      return err
    }
    
    // Otherwise, log and return 500
    logServerError({ route:'/api/contacts', method:'GET', traceId, err, extra:{ workspaceId: 'unknown' } })
    return NextResponse.json({ ok:false, traceId, error: err?.code || 'INTERNAL_ERROR' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  // Fail gracefully when DATABASE_URL is missing
  if (!env.DATABASE_URL) {
    return NextResponse.json({ 
      ok: false, 
      error: "DATABASE_URL_MISSING", 
      message: "Set DATABASE_URL to use contacts API" 
    }, { status: 500 })
  }

  const traceId = newTraceId()
  const prisma = getPrisma()
  
  try {
    // Use requireAuth helper
    const auth = await requireAuth()
    const workspaceId = auth.workspace.id

    if (!prisma) {
      return NextResponse.json({ 
        ok: false, 
        traceId, 
        error: 'DB_UNAVAILABLE', 
        message: 'Database not available' 
      }, { status: 503 })
    }

    const body = await req.json()
    const { name, email, company, title, source } = body

    if (!name || !email) {
      return NextResponse.json({ ok: false, traceId, error: 'MISSING_REQUIRED_FIELDS', message: 'Name and email are required' }, { status: 400 })
    }

    const contact = await prisma.contact.create({
      data: {
        id: randomUUID(),
        name,
        email,
        company: company || null,
        title: title || null,
        source: source || 'MANUAL',
        workspaceId,
        verifiedStatus: 'UNVERIFIED',
        score: 0,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json({ ok: true, contact, traceId })
  } catch (err: any) {
    // If it's a NextResponse (our auth error), return it directly
    if (err instanceof NextResponse) {
      return err
    }
    
    // Otherwise, log and return 500
    logServerError({ route:'/api/contacts', method:'POST', traceId, err, extra:{ workspaceId: 'unknown' } })
    return NextResponse.json({ ok:false, traceId, error: err?.code || 'INTERNAL_ERROR' }, { status: 500 })
  }
}
