import { NextRequest, NextResponse } from 'next/server';
import { getProviders } from '@/services/providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId, creatorId, variant = 'default' } = body;

    if (!brandId || !creatorId) {
      return NextResponse.json(
        { error: 'brandId and creatorId are required' },
        { status: 400 }
      );
    }

    const providers = getProviders();
    const mediaPack = await providers.mediaPack({
      brandId,
      creatorId,
      variant
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
