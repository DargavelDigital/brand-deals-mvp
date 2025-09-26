import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { z } from 'zod';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { log } from '@/lib/log';

const redlineRequestSchema = z.object({
  sowText: z.string().min(1, 'SOW text is required'),
  creatorType: z.enum(['influencer', 'content-creator', 'artist', 'consultant']).default('influencer'),
  industry: z.string().optional(),
});

interface RiskItem {
  clause: string;
  issue: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  suggestion: string;
  category: string;
}

export const POST = withIdempotency(async (request: NextRequest) => {
  try {
    const workspaceId = await requireSessionOrDemo(request);
    
    const body = await request.json();
    const validatedData = redlineRequestSchema.parse(body);

    const { sowText, creatorType, industry } = validatedData;

    // Simple AI-like analysis of SOW text
    const risks: RiskItem[] = [];
    const text = sowText.toLowerCase();

    // Check for common problematic clauses
    if (text.includes('exclusive') && !text.includes('non-exclusive')) {
      risks.push({
        clause: 'Exclusivity clause',
        issue: 'Exclusive partnerships limit your ability to work with other brands in the same category',
        riskLevel: 'High',
        suggestion: 'Negotiate for non-exclusive terms or limit exclusivity to specific time periods',
        category: 'exclusivity'
      });
    }

    if (text.includes('perpetual') || text.includes('forever')) {
      risks.push({
        clause: 'Perpetual rights',
        issue: 'Giving perpetual rights means the brand can use your content indefinitely without additional compensation',
        riskLevel: 'Critical',
        suggestion: 'Limit usage rights to 1-2 years with renewal terms',
        category: 'rights'
      });
    }

    if (text.includes('work for hire') || text.includes('work-made-for-hire')) {
      risks.push({
        clause: 'Work for hire',
        issue: 'Work for hire clauses transfer all rights to the brand, including your creative input',
        riskLevel: 'Critical',
        suggestion: 'Remove work for hire language and specify limited usage rights instead',
        category: 'rights'
      });
    }

    if (text.includes('indemnify') || text.includes('hold harmless')) {
      risks.push({
        clause: 'Indemnification clause',
        issue: 'Indemnification clauses make you liable for brand\'s legal issues',
        riskLevel: 'High',
        suggestion: 'Limit indemnification to your own actions only, not brand\'s products or services',
        category: 'liability'
      });
    }

    if (text.includes('approval') && text.includes('brand')) {
      risks.push({
        clause: 'Brand approval requirements',
        issue: 'Excessive approval requirements can delay content and limit creative freedom',
        riskLevel: 'Medium',
        suggestion: 'Limit approval to 2-3 rounds with specific timelines',
        category: 'approval'
      });
    }

    if (text.includes('penalty') || text.includes('fine')) {
      risks.push({
        clause: 'Penalty clauses',
        issue: 'Penalty clauses can result in financial penalties for minor issues',
        riskLevel: 'High',
        suggestion: 'Remove penalty language or limit to material breaches only',
        category: 'penalties'
      });
    }

    if (text.includes('confidential') && !text.includes('mutual')) {
      risks.push({
        clause: 'One-way confidentiality',
        issue: 'One-way confidentiality only protects the brand, not you',
        riskLevel: 'Medium',
        suggestion: 'Make confidentiality mutual to protect your own sensitive information',
        category: 'confidentiality'
      });
    }

    // Calculate overall risk level
    const riskCounts = risks.reduce((acc, risk) => {
      acc[risk.riskLevel] = (acc[risk.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let overallRisk: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    if (riskCounts.Critical > 0) overallRisk = 'Critical';
    else if (riskCounts.High > 0) overallRisk = 'High';
    else if (riskCounts.Medium > 0) overallRisk = 'Medium';

    // Generate summary
    const summary = risks.length === 0 
      ? 'The SOW appears to be well-balanced with no major red flags identified.'
      : `Found ${risks.length} potential issues ranging from ${overallRisk.toLowerCase()} to critical risk levels. Review the detailed analysis below.`;

    // Generate recommendations
    const recommendations = [
      'Always have a lawyer review contracts before signing',
      'Negotiate for fair usage rights and time limitations',
      'Ensure payment terms are clearly defined with specific deadlines',
      'Include termination clauses that protect both parties',
      'Consider adding performance metrics and success criteria'
    ];

    if (creatorType === 'influencer') {
      recommendations.push('Ensure FTC compliance requirements are clearly stated');
    }

    if (industry) {
      recommendations.push(`Consider industry-specific regulations for ${industry}`);
    }

    const result = {
      summary,
      risks,
      recommendations,
      overallRisk,
    };

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    log.error('SOW redline analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze SOW' },
      { status: 500 }
    );
  }
});