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

    // Fetch ALL brand matches for this workspace (BrandMatch has workspaceId directly)
    const brandMatches = await prisma().brandMatch.findMany({
      where: { workspaceId },
      include: {
        Brand: {
          select: {
            id: true,
            name: true,
            website: true,
            industry: true,
            description: true
          }
        }
      },
      orderBy: { score: 'desc' },
      take: 50
    });

    console.log('🔍 [brands/matched] BrandMatch records found:', brandMatches.length);

    // Also check BrandRun selectedBrandIds for filtering
    const latestRun = await prisma().brandRun.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      select: { selectedBrandIds: true }
    });

    console.log('🔍 [brands/matched] BrandRun found:', !!latestRun);
    console.log('🔍 [brands/matched] Selected brand IDs:', latestRun?.selectedBrandIds);

    // Filter to only selected brands if BrandRun exists
    let brands;
    if (latestRun?.selectedBrandIds && latestRun.selectedBrandIds.length > 0) {
      brands = brandMatches
        .filter(m => latestRun.selectedBrandIds.includes(m.brandId))
        .map(match => ({
          id: match.Brand.id,
          name: match.Brand.name,
          website: match.Brand.website,
          industry: match.Brand.industry,
          description: match.Brand.description,
          score: match.score
        }));
    } else {
      // If no BrandRun or no selectedBrandIds, show all matches
      brands = brandMatches.map(match => ({
        id: match.Brand.id,
        name: match.Brand.name,
        website: match.Brand.website,
        industry: match.Brand.industry,
        description: match.Brand.description,
        score: match.score
      }));
    }

    console.log('✅ [brands/matched] Brands to return:', brands.length);
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

