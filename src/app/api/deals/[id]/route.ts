import { NextRequest, NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { requireSession } from '@/lib/auth/requireSession'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/http/envelope'
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Next.js 15 compatible - params must be awaited

async function PUT_impl(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;



    const { id: dealId } = await params
    const { status, value, nextStep, description } = await request.json()

    // Check if deal exists and user has access
    const existingDeal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { workspace: true }
    })

    if (!existingDeal) {
      return NextResponse.json(fail('DEAL_NOT_FOUND', 404), { status: 404 })
    }

    // Check if user has access to this deal's workspace
    if (existingDeal.workspaceId !== (session.user as any).workspaceId) {
      return NextResponse.json(fail('UNAUTHORIZED', 403), { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}
    
    if (status !== undefined) updateData.status = status
    if (value !== undefined) updateData.value = value
    if (nextStep !== undefined) updateData.nextStep = nextStep
    if (description !== undefined) updateData.description = description

    // Update the deal
    const updatedDeal = await prisma.deal.update({
      where: { id: dealId },
      data: updateData
    })

    return NextResponse.json(ok(updatedDeal, { message: 'Deal updated successfully' }))
  } catch (error) {
    log.error('Error updating deal:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}

export const PUT = withIdempotency(PUT_impl);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { id: dealId } = await params

    // Get deal details
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { workspace: true }
    })

    if (!deal) {
      return NextResponse.json(fail('DEAL_NOT_FOUND', 404), { status: 404 })
    }

    // Check if user has access to this deal's workspace
    if (deal.workspaceId !== (session.user as any).workspaceId) {
      return NextResponse.json(fail('UNAUTHORIZED', 403), { status: 403 })
    }

    return NextResponse.json(ok(deal))
  } catch (error) {
    log.error('Error fetching deal:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}
