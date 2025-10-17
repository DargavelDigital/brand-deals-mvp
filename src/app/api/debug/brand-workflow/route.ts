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

    const userId = session.user.id;
    console.log('🔍 [debug] User ID:', userId);

    // Get workspace membership directly
    const membership = await prisma().membership.findFirst({
      where: { userId },
      select: { workspaceId: true }
    });

    console.log('🔍 [debug] Membership found:', !!membership);
    console.log('🔍 [debug] Workspace ID:', membership?.workspaceId);

    const workspaceId = membership?.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ 
        step: 'NO_WORKSPACE',
        message: 'User has no workspace membership',
        userId
      });
    }

    console.log('🔍 [debug] Workspace ID:', workspaceId);

    // Check for BrandRun
    const brandRun = await prisma().brandRun.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    console.log('🔍 [debug] BrandRun found:', !!brandRun);

    if (!brandRun) {
      return NextResponse.json({
        step: 'NO_BRAND_RUN',
        message: 'No BrandRun found. User needs to complete brand discovery workflow.',
        workspaceId,
        userId
      });
    }

    // Check selectedBrandIds
    console.log('🔍 [debug] Selected brand IDs:', brandRun.selectedBrandIds);

    if (!brandRun.selectedBrandIds || brandRun.selectedBrandIds.length === 0) {
      return NextResponse.json({
        step: 'NO_SELECTED_BRANDS',
        message: 'BrandRun exists but no brands selected.',
        workspaceId,
        brandRun: {
          id: brandRun.id,
          step: brandRun.step,
          createdAt: brandRun.createdAt,
          selectedBrandIds: brandRun.selectedBrandIds
        }
      });
    }

    // Check if Brand records exist
    const brands = await prisma().brand.findMany({
      where: { 
        id: { in: brandRun.selectedBrandIds }
      }
    });

    console.log('🔍 [debug] Brands found:', brands.length);

    // Check BrandMatch records
    const brandMatches = await prisma().brandMatch.findMany({
      where: { workspaceId },
      take: 10
    });

    console.log('🔍 [debug] Brand matches found:', brandMatches.length);

    return NextResponse.json({
      step: 'COMPLETE_DEBUG',
      success: true,
      workspaceId,
      userId,
      brandRun: {
        id: brandRun.id,
        step: brandRun.step,
        selectedBrandIds: brandRun.selectedBrandIds,
        selectedCount: brandRun.selectedBrandIds.length,
        createdAt: brandRun.createdAt
      },
      brands: {
        found: brands.length,
        names: brands.map(b => b.name),
        details: brands.map(b => ({
          id: b.id,
          name: b.name,
          website: b.website,
          industry: b.industry
        }))
      },
      brandMatches: {
        total: brandMatches.length,
        samples: brandMatches.slice(0, 5).map(m => ({
          brandId: m.brandId,
          score: m.score,
          createdAt: m.createdAt
        }))
      }
    });

  } catch (error: any) {
    console.error('❌ [debug] Error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

