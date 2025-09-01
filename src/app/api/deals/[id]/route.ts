import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/requireSession'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/http/envelope'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gate = await requireSession(request);
    if (!gate.ok) return gate.res;
    const session = gate.session!;

    const dealId = params.id
    const { stage, status, value, nextStep, description } = await request.json()

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
    
    if (stage !== undefined) updateData.stage = stage
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
    console.error('Error updating deal:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gate = await requireSession(request);
    if (!gate.ok) return gate.res;
    const session = gate.session!;

    const dealId = params.id

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
    console.error('Error fetching deal:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}
