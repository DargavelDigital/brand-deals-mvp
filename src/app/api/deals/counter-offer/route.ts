import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aiInvoke } from '@/ai/invoke';

const counterOfferRequestSchema = z.object({
  brandOffer: z.object({
    amount: z.number().min(0),
    deliverables: z.string(),
    format: z.string().optional(),
    timeline: z.string().optional(),
  }),
  creatorMetrics: z.object({
    audienceSize: z.number().min(1),
    engagementRate: z.number().min(0).max(100),
    cpm: z.number().min(0).optional(),
    previousBrands: z.array(z.string()).optional(),
  }),
  minCpm: z.number().min(0),
  floorFee: z.number().min(0),
  tone: z.enum(['professional', 'relaxed', 'fun']).default('professional'),
  additionalValue: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = counterOfferRequestSchema.parse(body);

    // Validate that the counter amount will meet minimum requirements
    const minCounterByCpm = validatedData.minCpm * (validatedData.creatorMetrics.audienceSize / 1000);
    const minCounter = Math.max(minCounterByCpm, validatedData.floorFee);

    // Call AI service to generate counter-offer
    const result = await aiInvoke('outreach.counterOffer.v1', {
      ...validatedData,
      // Ensure the AI respects minimum floors
      minCpm: validatedData.minCpm,
      floorFee: validatedData.floorFee,
    });

    // Validate the AI response meets our business rules
    if (result.counterAmount < minCounter) {
      return NextResponse.json(
        { 
          error: 'Generated counter amount below minimum threshold',
          minRequired: minCounter,
          generated: result.counterAmount
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Counter-offer generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate counter-offer' },
      { status: 500 }
    );
  }
}
