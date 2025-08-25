import { NextRequest, NextResponse } from 'next/server';
import { generateMediaPack } from '@/services/media';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brandId, variant } = await request.json();
    
    if (!brandId || !variant) {
      return NextResponse.json({ 
        error: 'Missing required fields: brandId and variant' 
      }, { status: 400 });
    }

    if (!['default', 'brand'].includes(variant)) {
      return NextResponse.json({ 
        error: 'Invalid variant. Must be "default" or "brand"' 
      }, { status: 400 });
    }

    const { workspaceId } = session.user;
    
    // Generate the media pack
    const mediaPackResult = await generateMediaPack(workspaceId, brandId, variant);
    
    return NextResponse.json({
      success: true,
      data: mediaPackResult
    });
  } catch (error) {
    console.error('Media pack generation API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Insufficient credits')) {
        return NextResponse.json({ 
          error: error.message,
          code: 'INSUFFICIENT_CREDITS'
        }, { status: 402 });
      }
      
      if (error.message.includes('No audit data available')) {
        return NextResponse.json({ 
          error: error.message,
          code: 'NO_AUDIT_DATA'
        }, { status: 400 });
      }
      
      if (error.message.includes('Brand not found')) {
        return NextResponse.json({ 
          error: error.message,
          code: 'BRAND_NOT_FOUND'
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
