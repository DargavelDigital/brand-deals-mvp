import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';

const calcRequestSchema = z.object({
  audienceSize: z.number().min(1, 'Audience size must be positive'),
  engagementRate: z.number().min(0, 'Engagement rate must be non-negative'),
  industry: z.string().min(1, 'Industry is required'),
  region: z.string().min(1, 'Region is required'),
});

export async function POST(request: NextRequest) {
  try {
    const workspaceId = await requireSessionOrDemo(request);
    
    const body = await request.json();
    const validatedData = calcRequestSchema.parse(body);

    // Industry multipliers
    const industryMultipliers = {
      'beauty': 1.2,
      'fashion': 1.1,
      'gaming': 0.9,
      'tech': 1.3,
      'fitness': 1.0,
      'food': 0.8,
      'travel': 1.1,
      'finance': 1.4,
      'education': 0.7,
      'entertainment': 1.0,
    };

    // Region multipliers
    const regionMultipliers = {
      'north-america': 1.0,
      'europe': 0.9,
      'asia-pacific': 0.8,
      'latin-america': 0.7,
      'africa': 0.6,
    };

    const industryMultiplier = industryMultipliers[validatedData.industry as keyof typeof industryMultipliers] || 1.0;
    const regionMultiplier = regionMultipliers[validatedData.region as keyof typeof regionMultipliers] || 1.0;

    // Base CPM calculation
    const baseCpm = 5; // Base $5 CPM
    const engagementMultiplier = Math.min(validatedData.engagementRate / 3.0, 2.0); // Cap at 2x for high engagement
    const audienceMultiplier = Math.min(validatedData.audienceSize / 10000, 3.0); // Cap at 3x for large audiences

    const cpmLow = Math.round(baseCpm * industryMultiplier * regionMultiplier * engagementMultiplier * 0.8);
    const cpmHigh = Math.round(baseCpm * industryMultiplier * regionMultiplier * engagementMultiplier * 1.2);

    // CPA estimate (Cost Per Action)
    const cpaEstimate = Math.round(cpmLow * 10); // Rough estimate

    // Flat fee range
    const impressions = validatedData.audienceSize * (validatedData.engagementRate / 100);
    const flatFeeLow = Math.round(impressions * cpmLow / 1000 * 0.7);
    const flatFeeHigh = Math.round(impressions * cpmHigh / 1000 * 1.3);

    const result = {
      cpmLow,
      cpmHigh,
      cpaEstimate,
      flatFeeRange: [flatFeeLow, flatFeeHigh] as [number, number],
    };

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Deal calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate deal pricing' },
      { status: 500 }
    );
  }
}