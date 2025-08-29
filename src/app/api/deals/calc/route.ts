import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const calcRequestSchema = z.object({
  audienceSize: z.number().min(1),
  engagementRate: z.number().min(0).max(100),
  industry: z.string().optional(),
  region: z.string().optional(),
});

const calcResponseSchema = z.object({
  cpmLow: z.number(),
  cpmHigh: z.number(),
  cpaEstimate: z.number(),
  flatFeeRange: z.tuple([z.number(), z.number()]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audienceSize, engagementRate, industry, region } = calcRequestSchema.parse(body);

    // Industry multipliers for CPM adjustments
    const industryMultipliers: Record<string, number> = {
      beauty: 1.2,
      fashion: 1.1,
      gaming: 0.8,
      tech: 1.0,
      fitness: 1.15,
      food: 0.9,
      travel: 1.25,
      finance: 1.3,
      education: 0.85,
      entertainment: 1.05,
    };

    // Region adjustments
    const regionMultipliers: Record<string, number> = {
      'north-america': 1.0,
      'europe': 0.9,
      'asia-pacific': 0.8,
      'latin-america': 0.7,
      'africa': 0.6,
    };

    // Base CPM calculation
    const baseCpm = 10;
    const industryMultiplier = industryMultipliers[industry?.toLowerCase() || ''] || 1.0;
    const regionMultiplier = regionMultipliers[region?.toLowerCase() || ''] || 1.0;
    
    const adjustedCpm = baseCpm * industryMultiplier * regionMultiplier;
    
    // CPM range (low to high)
    const cpmLow = Math.round(adjustedCpm * 0.8 * 100) / 100;
    const cpmHigh = Math.round(adjustedCpm * 1.2 * 100) / 100;
    
    // CPA calculation based on engagement
    const cpaEstimate = Math.round(adjustedCpm * (engagementRate * 0.01) * 100) / 100;
    
    // Flat fee range calculation
    const audienceInThousands = audienceSize / 1000;
    const avgCpm = (cpmLow + cpmHigh) / 2;
    const flatFeeLow = Math.round(audienceInThousands * avgCpm * 0.7);
    const flatFeeHigh = Math.round(audienceInThousands * avgCpm * 1.3);
    
    const result = calcResponseSchema.parse({
      cpmLow,
      cpmHigh,
      cpaEstimate,
      flatFeeRange: [flatFeeLow, flatFeeHigh],
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Deal calculator error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
