import { PromptPack } from '../types';

export const redlinePromptPack: PromptPack = {
  id: 'deals.redline.v1',
  version: '1.0.0',
  name: 'SOW Redline Analyzer',
  description: 'Analyzes brand SOWs to identify risky contract clauses and suggest improvements',
  
  systemPrompt: `You are a contract analyst specializing in influencer and creator deals. Your job is to review brand Statements of Work (SOWs) and identify potentially risky or unfavorable terms for creators.

Focus on these key risk areas:
- Exclusivity clauses that are too broad or long-term
- Perpetual or unlimited licensing terms
- Unrealistic performance expectations or KPIs
- Lack of clear termination rights
- Unfavorable payment terms or delays
- Overly broad intellectual property rights
- Non-compete clauses that are too restrictive
- Liability provisions that are one-sided
- Confidentiality terms that are too broad
- Force majeure clauses that don't protect creators

For each issue you identify:
1. Quote the specific problematic language
2. Explain why it's risky for the creator
3. Suggest specific improvements or alternatives
4. Rate the risk level (Low/Medium/High/Critical)

Be thorough but fair - not every clause needs to be flagged. Focus on terms that could genuinely harm the creator's business or create legal/financial risks.`,

  inputSchema: {
    type: 'object',
    properties: {
      sowText: { 
        type: 'string', 
        description: 'The full text of the brand SOW to analyze'
      },
      creatorType: {
        type: 'string',
        enum: ['influencer', 'content-creator', 'artist', 'consultant'],
        description: 'Type of creator this SOW is for'
      },
      industry: {
        type: 'string',
        description: 'Industry/vertical of the brand campaign'
      }
    },
    required: ['sowText']
  },

  outputSchema: {
    type: 'object',
    properties: {
      summary: {
        type: 'string',
        description: 'Overall assessment of the SOW risk level'
      },
      risks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            clause: { type: 'string', description: 'The specific problematic text' },
            issue: { type: 'string', description: 'What makes this clause risky' },
            riskLevel: { 
              type: 'string', 
              enum: ['Low', 'Medium', 'High', 'Critical'],
              description: 'Risk assessment level'
            },
            suggestion: { type: 'string', description: 'Specific improvement suggestion' },
            category: { 
              type: 'string', 
              enum: ['exclusivity', 'licensing', 'performance', 'termination', 'payment', 'ip-rights', 'non-compete', 'liability', 'confidentiality', 'other'],
              description: 'Category of the risk'
            }
          },
          required: ['clause', 'issue', 'riskLevel', 'suggestion', 'category']
        }
      },
      recommendations: {
        type: 'array',
        items: { type: 'string' },
        description: 'General recommendations for the creator'
      },
      overallRisk: {
        type: 'string',
        enum: ['Low', 'Medium', 'High', 'Critical'],
        description: 'Overall risk assessment of the entire SOW'
      }
    },
    required: ['summary', 'risks', 'recommendations', 'overallRisk']
  },

  examples: [
    {
      input: {
        sowText: `SCOPE OF WORK AGREEMENT

1. EXCLUSIVITY: Creator agrees to not work with any competing brands in the beauty industry for a period of 24 months following campaign completion.

2. LICENSING: Brand shall have perpetual, worldwide rights to use Creator's content in any media format without additional compensation.

3. PERFORMANCE: Creator must achieve minimum 5% engagement rate and 100,000 impressions within 30 days of posting.

4. TERMINATION: Brand may terminate this agreement at any time with 24 hours notice. Creator may only terminate with 90 days written notice.

5. PAYMENT: Payment will be made within 90 days of campaign completion, subject to brand approval of final deliverables.`,
        creatorType: 'influencer',
        industry: 'beauty'
      },
      output: {
        summary: 'This SOW contains several high-risk clauses that could significantly disadvantage the creator, particularly around exclusivity, licensing, and termination rights.',
        risks: [
          {
            clause: 'Creator agrees to not work with any competing brands in the beauty industry for a period of 24 months following campaign completion.',
            issue: '24-month exclusivity is extremely long and could severely limit creator\'s earning potential in a major industry',
            riskLevel: 'Critical',
            suggestion: 'Limit exclusivity to 3-6 months maximum, or restrict to specific product categories only',
            category: 'exclusivity'
          },
          {
            clause: 'Brand shall have perpetual, worldwide rights to use Creator\'s content in any media format without additional compensation.',
            issue: 'Perpetual licensing without compensation limits creator\'s ability to monetize their own content',
            riskLevel: 'Critical',
            suggestion: 'Limit licensing to 12-24 months with option to renew for additional compensation',
            category: 'licensing'
          },
          {
            clause: 'Creator must achieve minimum 5% engagement rate and 100,000 impressions within 30 days of posting.',
            issue: 'Unrealistic performance expectations that creator cannot guarantee, especially within 30 days',
            riskLevel: 'High',
            suggestion: 'Remove guaranteed performance metrics or make them aspirational goals, not requirements',
            category: 'performance'
          },
          {
            clause: 'Brand may terminate this agreement at any time with 24 hours notice. Creator may only terminate with 90 days written notice.',
            issue: 'Unbalanced termination rights heavily favor the brand',
            riskLevel: 'High',
            suggestion: 'Equalize termination notice periods (e.g., 14 days for both parties)',
            category: 'termination'
          },
          {
            clause: 'Payment will be made within 90 days of campaign completion, subject to brand approval of final deliverables.',
            issue: '90-day payment delay is excessive and brand approval requirement could lead to payment disputes',
            riskLevel: 'Medium',
            suggestion: 'Reduce payment timeline to 14-30 days and define clear approval criteria',
            category: 'payment'
          }
        ],
        recommendations: [
          'Negotiate shorter exclusivity period (3-6 months max)',
          'Limit licensing rights to 12-24 months with renewal compensation',
          'Remove guaranteed performance metrics',
          'Equalize termination notice periods',
          'Reduce payment timeline and clarify approval process',
          'Consider adding dispute resolution procedures'
        ],
        overallRisk: 'High'
      }
    }
  ],

  validationRules: [
    'All identified risks must include specific clause text',
    'Risk levels must be one of: Low, Medium, High, Critical',
    'Suggestions must be actionable and specific',
    'Overall risk assessment must consider all identified issues',
    'Analysis must be fair and not overly alarmist'
  ]
};
