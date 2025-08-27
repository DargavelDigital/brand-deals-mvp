import { NextRequest, NextResponse } from 'next/server';
import { getProviders } from '@/services/providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, template, customizations, brands, creatorProfile } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      return NextResponse.json(
        { error: 'At least one brand is required' },
        { status: 400 }
      );
    }

    const providers = getProviders();
    const mediaPack = await providers.mediaPack({
      workspaceId,
      brandId: brands[0]?.id || 'demo-brand',
      creatorId: 'demo-creator',
      variant: template || 'default',
      customizations,
      brands,
      creatorProfile
    });
    
    return NextResponse.json({ mediaPack });
  } catch (error: any) {
    console.error('Error generating media pack:', error);
    return NextResponse.json(
      { error: 'Failed to generate media pack' },
      { status: 500 }
    );
  }
}
