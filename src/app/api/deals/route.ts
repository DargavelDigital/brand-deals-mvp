import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/requireSession'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/http/envelope'

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { title, value, brandId, contactId, stage = 'Prospecting', description } = await request.json()

    // Validate required fields
    if (!title || !brandId) {
      return NextResponse.json(fail('MISSING_REQUIRED_FIELDS'), { status: 400 })
    }

    // Check if brand exists and user has access
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: { workspace: true }
    })

    if (!brand) {
      return NextResponse.json(fail('BRAND_NOT_FOUND', 404), { status: 404 })
    }

    if (brand.workspaceId !== (session.user as any).workspaceId) {
      return NextResponse.json(fail('UNAUTHORIZED', 403), { status: 403 })
    }

    // Check if contact exists and user has access (if provided)
    if (contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: { workspace: true }
      })

      if (!contact) {
        return NextResponse.json(fail('CONTACT_NOT_FOUND', 404), { status: 404 })
      }

      if (contact.workspaceId !== (session.user as any).workspaceId) {
        return NextResponse.json(fail('UNAUTHORIZED', 403), { status: 403 })
      }
    }

    // Create the deal
    const deal = await prisma.deal.create({
      data: {
        title,
        value: value ? parseInt(value.toString()) : null,
        brandId,
        workspaceId: (session.user as any).workspaceId,
        stage,
        description: description || '',
        status: 'OPEN'
      }
    })

    return NextResponse.json(ok(deal, { message: 'Deal created successfully' }), { status: 201 })
  } catch (error) {
    console.error('Error creating deal:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const gate = await requireSession(request);
    if (!gate.ok) return gate.res;
    const session = gate.session!;

    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')
    const status = searchParams.get('status')

    // Build where clause
    const whereClause: any = { workspaceId: (session.user as any).workspaceId }
    if (stage) whereClause.stage = stage
    if (status) whereClause.status = status

    // Get deals
    const deals = await prisma.deal.findMany({
      where: whereClause,
      include: {
        brand: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(ok(deals))
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}
