import { NextRequest, NextResponse } from 'next/server';
import { startSequence } from '@/services/sequence/start';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brandId, mediaPackId, contactIds, pauseFirstSend } = await request.json();
    
    if (!brandId || !mediaPackId || !contactIds || !Array.isArray(contactIds)) {
      return NextResponse.json({ 
        error: 'Missing required fields: brandId, mediaPackId, contactIds' 
      }, { status: 400 });
    }

    if (contactIds.length === 0) {
      return NextResponse.json({ 
        error: 'At least one contact must be selected' 
      }, { status: 400 });
    }

    const { workspaceId } = session.user;
    
    // Start the sequence
    const sequenceResult = await startSequence({
      workspaceId,
      brandId,
      mediaPackId,
      contactIds,
      pauseFirstSend: pauseFirstSend || false
    });
    
    return NextResponse.json({
      success: true,
      data: sequenceResult
    });
  } catch (error) {
    console.error('Sequence start API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Insufficient credits')) {
        return NextResponse.json({ 
          error: error.message,
          code: 'INSUFFICIENT_CREDITS'
        }, { status: 402 });
      }
      
      if (error.message.includes('Brand not found')) {
        return NextResponse.json({ 
          error: error.message,
          code: 'BRAND_NOT_FOUND'
        }, { status: 404 });
      }
      
      if (error.message.includes('Media pack not found')) {
        return NextResponse.json({ 
          error: error.message,
          code: 'MEDIA_PACK_NOT_FOUND'
        }, { status: 404 });
      }
      
      if (error.message.includes('No valid contacts found')) {
        return NextResponse.json({ 
          error: error.message,
          code: 'NO_VALID_CONTACTS'
        }, { status: 400 });
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
