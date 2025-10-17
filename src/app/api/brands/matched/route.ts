import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 [brands/matched] Starting...');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 [brands/matched] Session user ID:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('❌ [brands/matched] No session - unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get workspace membership directly
    const membership = await prisma().membership.findFirst({
      where: { userId },
      select: { workspaceId: true }
    });

    console.log('🔍 [brands/matched] Membership found:', !!membership);
    console.log('🔍 [brands/matched] Workspace ID:', membership?.workspaceId);

    if (!membership?.workspaceId) {
      console.log('❌ [brands/matched] No membership found');
      return NextResponse.json({ brands: [] });
    }

    const workspaceId = membership.workspaceId;

    // Fetch matched brands from the BrandRun
    const latestRun = await prisma().brandRun.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    console.log('🔍 [brands/matched] Latest BrandRun found:', !!latestRun);
    console.log('🔍 [brands/matched] BrandRun ID:', latestRun?.id);
    console.log('🔍 [brands/matched] Selected brand IDs:', latestRun?.selectedBrandIds);

    if (!latestRun || !latestRun.selectedBrandIds || latestRun.selectedBrandIds.length === 0) {
      console.log('❌ [brands/matched] No selected brands in BrandRun');
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

    console.log('✅ [brands/matched] Brands found:', brands.length);
    console.log('✅ [brands/matched] Brand names:', brands.map(b => b.name).join(', '));

    return NextResponse.json({ brands });

  } catch (error: any) {
    console.error('❌ [brands/matched] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch brands', brands: [] },
      { status: 500 }
    );
  }
}

