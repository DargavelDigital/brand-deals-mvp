import { NextResponse } from 'next/server'
import { safe } from '@/lib/api/safeHandler'
import { newTraceId, logServerError } from '@/lib/diag/trace'
import { pagingSchema } from '@/lib/http/paging'
import { getAuth } from '@/lib/auth/getAuth'
import { getPrisma } from '@/lib/db'
import { randomUUID } from 'crypto'

export const GET = safe(async (req) => {
  // Fail gracefully when DATABASE_URL is missing
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ 
      ok: false, 
      error: "DATABASE_URL_MISSING", 
      message: "Set DATABASE_URL to use contacts API" 
    }, { status: 500 })
  }

  const traceId = newTraceId()
  const prisma = getPrisma()
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
  
  // Dev-only auth bypass for local development
  let workspaceId: string;
  if (process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_AUTH_BYPASS === "1") {
    workspaceId = process.env.DEV_WORKSPACE_ID || "demo-workspace";
  } else {
    const auth = await getAuth(true)
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
    }
    workspaceId = auth.workspaceId
  }

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

  try {
    const where = {
      workspaceId,
      ...(q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } },
        ]
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
    logServerError({ route:'/api/contacts', method:'GET', traceId, err, extra:{ workspaceId } })
    return NextResponse.json({ ok:false, traceId, error: err?.code || 'INTERNAL_ERROR' }, { status: 500 })
  }
}, { route: '/api/contacts' })

export const POST = safe(async (req) => {
  // Fail gracefully when DATABASE_URL is missing
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ 
      ok: false, 
      error: "DATABASE_URL_MISSING", 
      message: "Set DATABASE_URL to use contacts API" 
    }, { status: 500 })
  }

  const traceId = newTraceId()
  const prisma = getPrisma()
  
  // If Prisma is not available, return error
  if (!prisma) {
    return NextResponse.json({ 
      ok: false, 
      traceId, 
      error: 'DB_UNAVAILABLE', 
      message: 'Database not available' 
    }, { status: 503 })
  }

  try {
    // Dev-only auth bypass for local development
    let workspaceId: string;
    if (process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_AUTH_BYPASS === "1") {
      workspaceId = process.env.DEV_WORKSPACE_ID || "demo-workspace";
    } else {
      const auth = await getAuth(true)
      if (!auth) {
        return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
      }
      workspaceId = auth.workspaceId
    }
    
    const body = await req.json()
    
    // Validate required fields
    if (!body.name?.trim() || !body.email?.trim()) {
      return NextResponse.json({ 
        ok: false, 
        traceId, 
        error: 'VALIDATION_ERROR', 
        message: 'name and email required' 
      }, { status: 400 })
    }

    const data = {
      id: randomUUID(), // Generate a unique ID for the contact
      workspaceId,
      name: body.name.trim(),
      email: body.email.trim(),
      title: body.title ?? null,
      company: body.company ?? null,
      phone: body.phone ?? null,
      status: body.status ?? 'ACTIVE',
      verifiedStatus: body.verifiedStatus ?? 'UNVERIFIED',
      tags: Array.isArray(body.tags) ? body.tags : [],
      notes: body.notes ?? null,
      source: body.source ?? null,
      updatedAt: new Date(), // Add updatedAt field
    }

    const created = await prisma.contact.create({ data })
    return NextResponse.json({ ok: true, data: created }, { status: 201 })
  } catch (err: any) {
    logServerError({ route:'/api/contacts', method:'POST', traceId, err })
    return NextResponse.json({ 
      ok: false, 
      traceId, 
      error: err?.code || 'INTERNAL_ERROR',
      message: err?.message || 'Failed to create contact'
    }, { status: 500 })
  }
}, { route: '/api/contacts' })
