import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aiInvoke } from '@/services/ai/runtime';

const redlineRequestSchema = z.object({
  sowText: z.string().min(10, 'SOW text must be at least 10 characters'),
  creatorType: z.enum(['influencer', 'content-creator', 'artist', 'consultant']).optional(),
  industry: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sowText, creatorType, industry } = redlineRequestSchema.parse(body);

    // Call AI service to analyze the SOW
    const result = await aiInvoke('deals.redline.v1', {
      sowText,
      creatorType: creatorType || 'influencer',
      industry: industry || 'general',
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('SOW redline analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze SOW' },
      { status: 500 }
    );
  }
}
