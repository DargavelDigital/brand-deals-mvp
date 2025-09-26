import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { z } from 'zod';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { log } from '@/lib/log';

const counterOfferRequestSchema = z.object({
  brandOffer: z.object({
    amount: z.number().min(0, 'Amount must be non-negative'),
    deliverables: z.string().min(1, 'Deliverables are required'),
    format: z.string().optional(),
    timeline: z.string().optional(),
  }),
  creatorMetrics: z.object({
    audienceSize: z.number().min(1),
    engagementRate: z.number().min(0),
    cpm: z.number().min(0),
  }),
  minCpm: z.number().min(0),
  floorFee: z.number().min(0),
  tone: z.enum(['professional', 'relaxed', 'fun']).default('professional'),
  additionalValue: z.string().optional(),
  historicalContext: z.object({
    category: z.string(),
    avgOffer: z.number(),
    avgFinal: z.number(),
    avgUpliftPct: z.number(),
  }).optional(),
});

export const POST = withIdempotency(async (request: NextRequest) => {
  try {
    const workspaceId = await requireSessionOrDemo(request);
    
    const body = await request.json();
    const validatedData = counterOfferRequestSchema.parse(body);

    const { brandOffer, creatorMetrics, minCpm, floorFee, tone, additionalValue, historicalContext } = validatedData;

    // Calculate suggested counter amount
    const baseAmount = brandOffer.amount;
    let counterAmount = baseAmount;

    // Apply uplift based on metrics
    const engagementUplift = Math.min(creatorMetrics.engagementRate / 3.0, 0.5); // Up to 50% uplift for high engagement
    const audienceUplift = Math.min(creatorMetrics.audienceSize / 50000, 0.3); // Up to 30% uplift for large audience
    
    // Historical context uplift
    const historicalUplift = historicalContext ? historicalContext.avgUpliftPct / 100 : 0.15; // Default 15% uplift
    
    const totalUplift = Math.min(engagementUplift + audienceUplift + historicalUplift, 0.8); // Cap at 80% uplift
    counterAmount = Math.round(baseAmount * (1 + totalUplift));

    // Ensure counter is above floor
    counterAmount = Math.max(counterAmount, floorFee);

    // Generate reasoning
    const reasoning = `Based on your ${creatorMetrics.engagementRate}% engagement rate and ${creatorMetrics.audienceSize.toLocaleString()} audience size, I'm suggesting a ${Math.round(totalUplift * 100)}% increase from the initial offer. This reflects the premium value of your engaged audience and proven performance metrics.`;

    // Generate draft email based on tone
    const toneStyles = {
      professional: {
        greeting: 'Thank you for reaching out with this exciting opportunity.',
        closing: 'I look forward to discussing this further and finding a mutually beneficial arrangement.',
        style: 'professional and data-driven'
      },
      relaxed: {
        greeting: 'Thanks for the opportunity! I\'m excited about the potential collaboration.',
        closing: 'Let me know your thoughts and we can chat more about making this work for both of us.',
        style: 'friendly and approachable'
      },
      fun: {
        greeting: 'This sounds like an amazing opportunity! I\'m super excited to work together.',
        closing: 'Can\'t wait to create something awesome together! Let\'s make it happen.',
        style: 'energetic and enthusiastic'
      }
    };

    const style = toneStyles[tone];
    
    const draftEmail = `Subject: Partnership Proposal - ${brandOffer.deliverables}

Hi there,

${style.greeting}

I've reviewed your proposal for ${brandOffer.deliverables} and I'm excited about the potential collaboration. After analyzing my audience metrics and the value I can provide, I'd like to propose a counter-offer of $${counterAmount.toLocaleString()}.

Here's my reasoning:
• My audience of ${creatorMetrics.audienceSize.toLocaleString()} has a ${creatorMetrics.engagementRate}% engagement rate
• This translates to approximately ${Math.round(creatorMetrics.audienceSize * creatorMetrics.engagementRate / 100).toLocaleString()} highly engaged viewers per post
• Based on industry standards, this represents significant value for your brand

${additionalValue ? `Additional value I can provide: ${additionalValue}` : ''}

I'm confident this partnership will deliver excellent results for your brand. ${style.closing}

Best regards,
[Your Name]`;

    // Generate negotiation tips
    const negotiationTips = [
      'Emphasize your unique audience demographics and engagement quality',
      'Provide specific examples of successful brand partnerships',
      'Offer additional value like extended posting windows or cross-platform promotion',
      'Be flexible on timeline if it helps justify the higher rate',
      'Consider offering a performance bonus structure'
    ];

    if (historicalContext) {
      negotiationTips.unshift(`Historical data shows ${historicalContext.category} partnerships typically see ${historicalContext.avgUpliftPct.toFixed(1)}% rate increases`);
    }

    const result = {
      counterAmount,
      reasoning,
      draftEmail,
      negotiationTips,
    };

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    log.error('Counter-offer generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate counter-offer' },
      { status: 500 }
    );
  }
});