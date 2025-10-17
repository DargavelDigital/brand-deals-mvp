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
      return NextResponse.json({ items: [] });
    }

    // Fetch media packs for the workspace
    const packs = await prisma().mediaPack.findMany({
      where: { workspaceId: membership.workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        packId: true,
        theme: true,
        createdAt: true
      }
    });

    // Format for the picker
    const items = packs.map(pack => ({
      id: pack.packId,
      variant: (pack.theme as any)?.variant || 'default',
      createdAt: pack.createdAt.toISOString()
    }));

    return NextResponse.json({ items });

  } catch (error: any) {
    console.error('Media pack list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch media packs', items: [] },
      { status: 500 }
    );
  }
}

