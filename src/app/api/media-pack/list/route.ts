import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 [media-pack/list] Starting...');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 [media-pack/list] Session user ID:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('❌ [media-pack/list] No session - unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get workspace for this user
    const membership = await prisma().membership.findFirst({
      where: { userId },
      include: { workspace: true }
    });

    console.log('🔍 [media-pack/list] Membership found:', !!membership);
    console.log('🔍 [media-pack/list] Workspace ID:', membership?.workspaceId);

    if (!membership) {
      console.log('❌ [media-pack/list] No membership found');
      return NextResponse.json({ items: [] });
    }

    const workspaceId = membership.workspaceId;

    // Fetch media packs for the workspace
    const packs = await prisma().mediaPack.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        packId: true,
        variant: true,
        theme: true,
        createdAt: true
      }
    });

    console.log('🔍 [media-pack/list] Media packs found:', packs.length);
    if (packs.length > 0) {
      console.log('🔍 [media-pack/list] First pack:', {
        id: packs[0].packId,
        variant: packs[0].variant,
        createdAt: packs[0].createdAt
      });
    }

    // Format for the picker
    const items = packs.map(pack => ({
      id: pack.packId,
      variant: pack.variant || (pack.theme as any)?.variant || 'default',
      createdAt: pack.createdAt?.toISOString() || new Date().toISOString()
    }));

    console.log('✅ [media-pack/list] Items formatted:', items.length);
    console.log('✅ [media-pack/list] Variants:', items.map(i => i.variant).join(', '));

    return NextResponse.json({ items });

  } catch (error: any) {
    console.error('❌ [media-pack/list] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch media packs', items: [] },
      { status: 500 }
    );
  }
}

