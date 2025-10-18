import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(
  req: Request,
  { params }: { params: { stepId: string } }
) {
  try {
    const stepId = params.stepId.replace('.png', ''); // Remove .png extension if present

    // Update sequence step with opened timestamp (only if not already opened)
    await prisma().sequenceStep.updateMany({
      where: { 
        id: stepId,
        openedAt: null // Only update if not already opened
      },
      data: {
        openedAt: new Date(),
        status: 'OPENED'
      }
    });

    console.log('📬 Email opened:', stepId);

  } catch (error) {
    console.error('❌ Track open error:', error);
    // Still return pixel even if tracking fails
  }

  // Always return the tracking pixel
  return new NextResponse(TRACKING_PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-cache, no-store, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

