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

    // Get workspace membership directly
    const membership = await prisma().membership.findFirst({
      where: { userId },
      select: { workspaceId: true }
    });

    console.log('🔍 [media-pack/list] Membership found:', !!membership);
    console.log('🔍 [media-pack/list] Workspace ID:', membership?.workspaceId);

    if (!membership?.workspaceId) {
      console.log('❌ [media-pack/list] No membership found');
      return NextResponse.json({ items: [] });
    }

    const workspaceId = membership.workspaceId;

    // Fetch media packs for the workspace
    const packs = await prisma().mediaPack.findMany({
      where: { 
        workspaceId,
        status: 'READY' // Only show completed packs
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        packId: true,
        variant: true,
        brandId: true,
        brandName: true,
        fileName: true,
        fileUrl: true,
        status: true,
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

    // Format for the picker - include all pack data
    const items = packs.map(pack => ({
      id: pack.packId,
      variant: pack.variant || (pack.theme as any)?.variant || 'default',
      brandId: pack.brandId,
      brandName: pack.brandName,
      fileName: pack.fileName,
      fileUrl: pack.fileUrl,
      status: pack.status,
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

