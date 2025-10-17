import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get workspace for this user
    const membership = await prisma().membership.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true }
    });

    if (!membership) {
      return NextResponse.json({ brands: [] });
    }

    // Fetch matched brands from the BrandRun
    const latestRun = await prisma().brandRun.findFirst({
      where: { workspaceId: membership.workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestRun || !latestRun.selectedBrandIds || latestRun.selectedBrandIds.length === 0) {
      return NextResponse.json({ brands: [] });
    }

    // Fetch the brand details
    const brands = await prisma().brand.findMany({
      where: {
        id: { in: latestRun.selectedBrandIds }
      },
      select: {
        id: true,
        name: true,
        website: true,
        industry: true,
        description: true
      },
      take: 50
    });

    return NextResponse.json({ brands });

  } catch (error: any) {
    console.error('Matched brands list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch brands', brands: [] },
      { status: 500 }
    );
  }
}

