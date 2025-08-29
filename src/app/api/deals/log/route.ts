import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const dealLogRequestSchema = z.object({
  dealId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  brandId: z.string().min(1, 'Brand ID is required'),
  offerAmount: z.number().min(0, 'Offer amount must be positive'),
  counterAmount: z.number().min(0).optional(),
  finalAmount: z.number().min(0).optional(),
  status: z.enum(['OPEN', 'COUNTERED', 'WON', 'LOST']).default('OPEN'),
  category: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = dealLogRequestSchema.parse(body);

    // Get workspace ID from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { memberships: { include: { workspace: true } } },
    });

    if (!user?.memberships?.[0]?.workspaceId) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
    }

    const workspaceId = user.memberships[0].workspaceId;

    // Validate brand exists
    const brand = await prisma.brand.findFirst({
      where: { id: validatedData.brandId, workspaceId },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    let deal;

    if (validatedData.dealId) {
      // Update existing deal
      deal = await prisma.deal.update({
        where: { 
          id: validatedData.dealId,
          workspaceId // Ensure deal belongs to workspace
        },
        data: {
          title: validatedData.title,
          description: validatedData.description,
          offerAmount: validatedData.offerAmount,
          counterAmount: validatedData.counterAmount,
          finalAmount: validatedData.finalAmount,
          status: validatedData.status,
          category: validatedData.category,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new deal
      deal = await prisma.deal.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          offerAmount: validatedData.offerAmount,
          counterAmount: validatedData.counterAmount,
          finalAmount: validatedData.finalAmount,
          status: validatedData.status,
          category: validatedData.category,
          brandId: validatedData.brandId,
          creatorId: user.id,
          workspaceId,
        },
      });
    }

    return NextResponse.json(deal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Deal logging error:', error);
    return NextResponse.json(
      { error: 'Failed to log deal' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get workspace ID from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { memberships: { include: { workspace: true } } },
    });

    if (!user?.memberships?.[0]?.workspaceId) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
    }

    const workspaceId = user.memberships[0].workspaceId;

    // Get deals for the workspace
    const deals = await prisma.deal.findMany({
      where: { workspaceId },
      include: { brand: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(deals);
  } catch (error) {
    console.error('Deal fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}
